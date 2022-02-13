<template>

    <form @submit.prevent="send">
        <div class="row">
          <label for="accountsDate" class="col-auto col-form-label">Состояния счетов на дату</label>
          <div class="col-auto">
            <input id="accountsDate" type="date" class="form-control w-auto" v-model="inputFormData.dateOfCapital" :max="maxDate" required @change="getDataAtDateOfCapital" />
          </div>
        </div>
        <div class="row align-items-end mt-2">
          <div class="col-4">
            Счёт
          </div>
          <div class="col-3">
            Сумма
          </div>
          <div class="col-2">
            Валюта
          </div>
          <div class="col-3 col-lg-2">
            Включать в сумму
          </div>
        </div>

        <hr class="mt-0">

        <div class="row my-2" v-for="(account, key) in data.accounts" :key="key" :class="key == inputFormData.accountName && 'text-primary'">

          <div class="col-4" >
            <span @click="applySelected(key)">{{key + " "}}</span>
            
            <svg @click="changeName(account.account)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
              <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
            </svg>
          </div>
          <div class="col-3" @click="applySelected(key)">
            {{account.value}}
          </div>
          <div class="col-2" @click="applySelected(key)">
            {{currency[account.currency]}}
          </div>
          <div class="col-3 col-lg-2 text-center">
            <input type="checkbox" class="form-check-input" v-model="includeInSum" :value="key" />
          </div>

        </div>
        <div class="row">
          <div class="col-4">
            Сумма
          </div>
          <div class="col-3">
            {{sum}}
          </div>
          <div class="col-2">
            Рубль
          </div>
          <div class="col-3 col-lg-2">
          </div>
        </div>

        <div class="row mt-2">
          <label for="accountName" class="col-2 col-lg-1 col-form-label">Счёт</label>
          <div class="col col-lg-5">
            <input id="accountName" list="datalistAccounts" class="form-control" type="text" required v-model="inputFormData.accountName" @input="accountNameChanged" />
            <datalist id="datalistAccounts">
              <option v-for="(account, key) in data.accounts">{{key}}</option>
            </datalist>
          </div>
        </div>
        <div class="row mt-2">
          <label for="value" ref="sumInput" class="col-2 col-lg-1 col-form-label">Сумма</label>
          <div class="col-4 col-lg-2"> 
            <input id="value" type="text" class="form-control" required v-model="inputFormData.value" @input="valueChanged"/>
          </div>

          <label for="currency" class="col-2 col-lg-1 col-form-label">Валюта</label>
          <div class="col col-lg-2">
            <select id="currency" class="form-select" v-model="inputFormData.currency" required :disabled="inputFormData.accountName === selected">
              <option v-for="(curr, key) in currency" :value="key">{{curr}}</option>
            </select>
          </div>
        </div>
        <div class="my-2">
          <input class="btn g-2" :class="inputFormData.accountName === selected ? 'btn-success' : 'btn-warning'" type="submit" :value="inputFormData.accountName === selected ? 'Сохранить' : 'Создать новую запись'" />
        </div>
    </form>

</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount, reactive, computed } from 'vue';
import Chart from "./Chart.vue";
// @ts-ignore
import sendData from "./../functions/sendData";
// @ts-ignore
import updateAccountInfo from "./../functions/updateAccountInfo";
// @ts-ignore
import getLatestData from "./../functions/getLatestData";
// @ts-ignore
import getDataAtDate from "./../functions/getDataAtDate";
// @ts-ignore
import getCurrencyPrices from "./../functions/getCurrencyPrices";
// @ts-ignore
import currency from "./../util/currency.json";


const includeInSum = ref([]);
const selected = ref("");
const sumInput = ref(null);
// const dateOfCapital = ref(new Date().toISOString().replace(/T.*/,'').split('-').join('-'));

let tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
const maxDate = (new Date(new Date().getTime() + tzoffset)).toISOString().replace(/T.*/, '').split('-').join('-');

// let requestFormatDate = (new Date(new Date(date).getTime() - tzoffset)).toISOString().replace(/T.*/, '').split('-').join('-');
let inputFormData = reactive({
  accountName: undefined,
  value: undefined,
  currency: "RUR",
  dateOfCapital: (new Date(new Date().getTime() + tzoffset)).toISOString().replace(/T.*/, '').split('-').join('-'),
});

let data = reactive({
    accounts: undefined,
    prices: undefined,
    selectedDate: new Date(),
});

let sum = computed(() => {
  let sum = 0;
  if( !data?.accounts) {
    return 0;
  }
  Object.keys(data?.accounts).forEach(account => {
    if (!includeInSum.value.includes(account)) {
      return;
    }

    let acc = data.accounts[account];

    if (acc.currency !== "RUR") {
      sum += Number.parseFloat(acc.value || 0) * (data.prices?.[acc?.currency]?.Value || 1);
      return;
    }
    sum += Number.parseFloat(acc.value || 0);
  });
  return sum.toLocaleString();
});

async function send() {
    if (inputFormData.accountName !== selected.value && !confirm(`Создать новый счёт ${inputFormData.accountName}?`)) {
      return;
    }
    if (inputFormData.value === data.accounts[inputFormData.accountName].value) {
      return console.log("equals");
    }
    await sendData(inputFormData);
    await getDataAtDate(new Date(new Date(inputFormData.dateOfCapital).getTime() + tzoffset), dataLoadCallback);
    selected.value = inputFormData.accountName;
    inputFormData.accountId = data.accounts[inputFormData.accountName].account;
}

function applySelected(account: any) {
  console.log(account, data.accounts[account]);
  inputFormData.value = data.accounts[account].value;
  inputFormData.currency = data.accounts[account].currency;
  inputFormData.accountId = data.accounts[account]["account"];
  inputFormData.accountName = account;
  selected.value = inputFormData.accountName;
  sumInput.value.focus();
}

function dataLoadCallback(result) {
  console.log("res", result);
  data.accounts = result;
  includeInSum.value = Object.keys(data.accounts);
}

// getCurrencyPrices(new Date(), (newPrices) => {
//   data.prices = newPrices;
// });

function accountNameChanged() {
  if (inputFormData.accountName != selected) {
    selected.value = "";
    inputFormData.value = undefined;
  }
  if (Object.keys(data.accounts).includes(inputFormData.accountName)) {
    applySelected(inputFormData.accountName);
    selected.value = inputFormData.accountName;
  }
}

function getDataAtDateOfCapital() {
  inputFormData.value = undefined;
  inputFormData.currency = undefined;
  inputFormData.accountName = undefined;
  inputFormData.accountId = undefined;
  selected.value = "";
  data.prices = undefined;
  getDataAtDate(new Date(new Date(inputFormData.dateOfCapital).getTime() + tzoffset), dataLoadCallback);
  // getCurrencyPrices(new Date(inputFormData.dateOfCapital), (newPrices) => {
  //   data.prices = newPrices;
  // });
}

function valueChanged() {
  inputFormData.value = Number.parseFloat(inputFormData.value) >= 0 ? Number.parseFloat(inputFormData.value) : undefined;
}

async function changeName(accountId) {
  let newName = prompt("Введите новое имя счёта.");
  if (!newName) {
    return;
  }
  console.log(newName);
  console.log(accountId);
  let newData = {name: newName};
  console.log("newData", newData);
  await updateAccountInfo(accountId, newData);
  getDataAtDate(new Date(new Date(inputFormData.dateOfCapital).getTime() + tzoffset), dataLoadCallback);
}

getDataAtDate(new Date(new Date().getTime() + tzoffset), dataLoadCallback);
</script>


<style scoped>

</style>
