<template>

    <form @submit.prevent="send">
        <div class="row">
          <label for="accountsDate" class="col-auto col-form-label">Состояния счетов на дату</label>
          <div class="col-auto">
            <input id="accountsDate" type="date" class="form-control w-auto" v-model="inputFormData.dateOfCapital" :max="maxDate" required @change="getDataAtDateOfCapital" />
          </div>
        </div>
        <div class="row mt-2 align-items-end">
          <div class="col-6 col-lg-3">
            Счёт
          </div>
          <div class="col col-lg-2">
            Сумма
          </div>
        </div>

        <hr class="mt-0">
        <div v-if="!data.accounts" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div class="row my-2" v-for="(account, key) in data.accounts" :key="key" :class="key == inputFormData.accountName && 'text-primary'">

          <div class="col-6 col-lg-3 text-nowrap">
            <span class="text-nowrap" @click="applySelected(key)">{{key + " "}}</span>
            
            <svg @click="changeName(account.account)" xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
              <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
            </svg>
          </div>
          <div class="col-4 col-lg-2" @click="applySelected(key)">
            {{formatValue(account.value, account.currency)}}
          </div>
          <div class="col-2 col-lg-2 text-center">
            <input type="checkbox" class="form-check-input" v-model="includeInSum" :value="key" />
          </div>

        </div>

        <hr class="my-2">
        
        <div class="row my-2">
          <div class="col col-lg-3">
            Сумма
          </div>
          <div class="col-auto col-lg-2">
            {{formatValue(sum)}}
          </div>
          <div class="col-2 text-center">
            <input type="checkbox" class="form-check-input" checked disabled readonly/>
          </div>
        </div>

        <div class="row mt-2">
          <label for="accountName" class="col-2 col-lg-1 col-form-label">Счёт</label>
          <div class="col col-lg-5">
            <input id="accountName" list="datalistAccounts" class="form-control" type="text" required v-model="inputFormData.accountName" @input="accountNameChanged" maxlength="20"/>
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
import currentTime from "./../functions/getCurrentTime";
// @ts-ignore
import currency from "./../util/currency.json";


const includeInSum = ref([]);
const selected = ref("");
const sumInput = ref(null);
// const dateOfCapital = ref(new Date().toISOString().replace(/T.*/,'').split('-').join('-'));

const maxDate = currentTime.getStandardDateString();
// console.log("maxDate", currentTime.getTimeFromString(currentTime.getStandardDateString()), new Date(currentTime.getStandardDateString()));

// let requestFormatDate = (new Date(new Date(date).getTime() - tzoffset)).toISOString().replace(/T.*/, '').split('-').join('-');
let inputFormData = reactive({
  accountName: undefined,
  value: undefined,
  accountId: undefined,
  currency: "RUR",
  dateOfCapital: currentTime.getStandardDateString(),
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

  includeInSum.value.forEach(element => {
    let acc = data.accounts[element];

    if (acc.currency !== "RUR") {
      sum += Number.parseFloat(acc.value || 0) * (data.prices?.[acc?.currency]?.Value || 1);
      return;
    }
    sum += Number.parseFloat(acc.value || 0);
  });

  return sum;
});

async function send() {
    if (!Object.keys(data.accounts).includes(inputFormData.accountName) && !confirm(`Создать новый счёт ${inputFormData.accountName}?`)) {
      return;
    }
    if (data.accounts[inputFormData.accountName] && inputFormData.value === data.accounts[inputFormData.accountName].value) {
      return console.log("equals");
    }
    await sendData(inputFormData);
    const result = await getDataAtDate(currentTime.getTimeFromString(inputFormData.dateOfCapital));
    dataLoadCallback(result);
}

function applySelected(account: any) {
  // console.log(account, data.accounts[account]);
  selected.value = account;

  inputFormData.value = data.accounts[account].value;
  inputFormData.currency = data.accounts[account].currency;
  inputFormData.accountId = data.accounts[account]["account"];
  inputFormData.accountName = account;
  sumInput.value.focus();
}

async function dataLoadCallback(result) {
  // console.log("res", result);
  data.accounts = result;
  includeInSum.value = Object.keys(data.accounts);
  if (Object.values(data.accounts).some(item => item.currency !== "RUR" && item.value)) {
    getCurrencyPrices(currentTime.getTimeFromString(inputFormData.dateOfCapital)).then(newPrices => {
      data.prices = newPrices;
    });
  }
}


function accountNameChanged() {
  if (inputFormData.accountName != selected) {
    selected.value = "";
    inputFormData.value = undefined;
    inputFormData.accountId = undefined;
  }
  if (Object.keys(data.accounts).includes(inputFormData.accountName)) {
    applySelected(inputFormData.accountName);
    // selected.value = data.accounts[inputFormData.accountName];
  }
}

async function getDataAtDateOfCapital() {
  inputFormData.value = undefined;
  inputFormData.currency = undefined;
  inputFormData.accountName = undefined;
  inputFormData.accountId = undefined;
  // selected.value = {};
  data.prices = undefined;
  data.accounts = undefined;
  const result = await getDataAtDate(currentTime.getTimeFromString(inputFormData.dateOfCapital));
  dataLoadCallback(result);
}

function valueChanged() {
  inputFormData.value = Number.parseFloat(inputFormData.value) >= 0 ? Number.parseFloat(inputFormData.value) : undefined;
}

async function changeName(accountId) {
  let newName = prompt("Введите новое имя счёта.");
  if (!newName) {
    return;
  }
  if (Object.keys(data.accounts).includes(newName)) {
    alert("Cчёт " + newName + " уже существует");
    return;
  }
  // console.log(newName);
  // console.log(accountId);
  let newData = {name: newName};
  // console.log("newData", newData);
  await updateAccountInfo(accountId, newData);
  const result = await getDataAtDate(currentTime.getTimeFromString(inputFormData.dateOfCapital));
  await dataLoadCallback(result);
}

const rurValueFormatter = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2});
const usdValueFormatter = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2});
const eurValueFormatter = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 2});

function formatValue(value, currency = "RUR") {
  if (currency === "RUR") {
    return rurValueFormatter.format(value || 0) + " ₽";
  }
  if (currency === "USD") {
    return usdValueFormatter.format(value || 0);
  }
  if (currency === "EUR") {
    return eurValueFormatter.format(value || 0);
  }
}

getDataAtDate(new Date()).then(result => dataLoadCallback(result));
</script>


<style scoped>

</style>
