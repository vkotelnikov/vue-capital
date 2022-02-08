<template>
<table>
  <tr v-for="(account, key) in data.accounts"> 
    <td>
      {{key}}
    </td>
    <td>
      {{account.value}}
    </td>
    <td>
      {{currency[account.currency]}}
    </td>
  </tr>
  <tr>
  <td>
    Сумма
    </td>
    <td v-if="data.prices">
      {{sum}}
    </td>
    <td>
      Рубль
    </td>
  </tr>
</table>
<form @submit.prevent="send">
  <div>
    Счёт<input type="text" required v-model="data.account"/>
    <select v-model="selectedAccount" @change="applySelected(selectedAccount)">
      <option v-for="(acc, key) in data.accounts" :value="{acc, key}">{{key}}</option>
    </select>
  </div>
  <div>Сумма<input type="text" required v-model.number="data.value"/> Валюта
    <select v-model="data.selectedCurrency">
      <option v-for="(curr, key) in currency" :value="key">{{curr}}</option>
    </select>
  </div>
  <div><input type="submit" value="Всё"/></div>
</form>

<Chart v-if="data.accounts" :accounts="data.accounts"></Chart>

</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount, reactive, computed } from 'vue';
import Chart from "./Chart.vue";
// @ts-ignore
import sendData from "./../functions/sendData";
// @ts-ignore
import getLatestData from "./../functions/getLatestData";
// @ts-ignore
import getCurrencyPrices from "./../functions/getCurrencyPrices";
// @ts-ignore
import currency from "./../util/currency.json";

interface Account {
  currency: string;
  value: any;
}

interface Data {
  account: string,
  value: string | number,
  accounts: Account,
  selectedCurrency: string,
  prices: any,
}

let a: Data = {
    account: "",
    value: undefined,
    accounts: undefined,
    selectedCurrency: "rur",
    prices: undefined,
};

let data = reactive(a);
let selectedAccount = {};
// let prices = reactive({data: {}});

let sum = computed(() => {
  let sum = 0;
  if(!data.prices) {
    return 0;
  }
  Object.keys(data?.accounts).forEach(account => {
    let acc = data.accounts[account];
    if (acc.currency.toUpperCase() !== "RUR") {
      // console.log(acc.currency.toUpperCase(), data.prices[acc.currency.toUpperCase()])
      sum += Number.parseFloat(data.accounts[account].value) * data.prices[acc.currency.toUpperCase()].Value;
      return;
    }
    sum += Number.parseFloat(data.accounts[account].value);
  });
  return sum.toLocaleString();
})

onMounted(() => {
  // console.log("mounted");
  // console.log(getAccounts());
  // updateData();
  // let date = new Date();
  // date.setDate(date.getDate() - 1);
  // getCurrencyPrices(date, (newPrices) => {
  //   // console.log("newPrices", newPrices);
  //   data.prices = newPrices;
  // });
});

function send() {
    sendData(data.account, data.value, data.selectedCurrency);
}

function applySelected(account: any) {
  data.value = account.acc.value;
  data.account = account.key;
}

function updateData() {
  getLatestData((latestData:any) => {
    data.accounts = latestData;
  });
}

updateData();
let date = new Date();
date.setDate(date.getDate() - 2);
getCurrencyPrices(date, (newPrices) => {
  // console.log("newPrices", newPrices);
  data.prices = newPrices;
});

</script>


<style scoped>

table {
  display: inline-block;
}

a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
