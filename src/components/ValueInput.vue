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
        <div class="row my-2" v-for="(account, key) in data.accounts" :class="key == inputFormData.accountName && 'text-primary'">
          <div class="col-4" @click="applySelected(key)">
            {{key}}
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
  currency: "rur",
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
    console.log(sum);
    let acc = data.accounts[account];
    console.log(acc);
    if (acc.currency.toUpperCase() !== "RUR") {
      sum += Number.parseFloat(acc.value || 0) * (data.prices?.[acc?.currency?.toUpperCase()]?.Value || 1);
      return;
    }
    sum += Number.parseFloat(acc.value || 0);
  });
  return sum.toLocaleString();
});

async function send() {
    if (inputFormData.accountName !== selected && !confirm(`Создать новый счёт ${inputFormData.accountName}?`)) {
      return;
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

getDataAtDate(new Date(new Date().getTime() + tzoffset), dataLoadCallback);
</script>


<style scoped>

</style>
