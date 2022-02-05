<template>
<table>
  <tr v-for="(account, key) in data.accounts"> 
    <td>
      {{key}}
    </td>
    <td>
      {{account.value}}
    </td>
  </tr>
  <tr>
  <td>
    Сумма
    </td>
    <td>
      {{sum}}
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
  <div>Сумма<input type="text" required v-model="data.value"/> Валюта
    <select v-model="selectedCurrency">
      <option v-for="(curr, key) in currency" :value="{curr, key}">{{key}}</option>
    </select>
  </div>
  <div><input type="submit" value="Всё"/></div>
</form>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount, reactive, computed } from 'vue';
// @ts-ignore
import sendData from "./../functions/sendData";
// @ts-ignore
import getLatestData from "./../functions/getLatestData";
import currency from "./../util/currency.json";

interface Account {
  currency: string;
  value: any;
}

let data = reactive({
    account: "",
    value: undefined,
    accounts: <any> {},
});
let selectedAccount = {};
let selectedCurrency = 

let sum = computed(() => {
  let sum = 0;
  Object.keys(data?.accounts).forEach(account => {
    sum += Number.parseFloat(data.accounts[account].value);
  });
  return sum.toLocaleString();
})

onMounted(() => {
  // console.log("mounted");
  // console.log(getAccounts());
  updateData();
});

function send() {
    sendData(data.account, data.value);
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
