<template>

    <form @submit.prevent="send">
        <div>
            <input type="date" v-model="inputFormData.dateOfCapital" required @change="getDataAtDateOfCapital" />
        </div>
        <table>
            <tr>
                <th>
                    Счёт
                </th>
                <th>
                    Сумма
                </th>
                <th>
                    Валюта
                </th>
                <th>
                    Включать в сумму
                </th>
            </tr>
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
                <td>
                    <input type="checkbox" v-model="includeInSum" :value="key" />
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
        <div>
            Счёт<input type="text" required v-model="inputFormData.accountName" @input="accountNameChanged" />
            <select v-model="selected" @change="applySelected(selected)">
                <option v-for="(acc, key) in data.accounts" :value="{name: key, value: acc.value, currency: acc.currency}">{{key}}</option>
            </select>
        </div>
        <div>Сумма<input type="text" required v-model.number="inputFormData.value" />
            Валюта
            <select v-model="inputFormData.currency" :disabled="inputFormData.accountName === selected.name">
                <option v-for="(curr, key) in currency" :value="key" required>{{curr}}</option>
            </select>
        </div>
        <div><input type="submit" value="Сохранить" /></div>
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
const selected = ref({});
// const dateOfCapital = ref(new Date().toISOString().replace(/T.*/,'').split('-').join('-'));

let inputFormData = reactive({
  accountName: undefined,
  value: undefined,
  currency: "rur",
  dateOfCapital: new Date().toISOString().replace(/T.*/,'').split('-').join('-'),
});

let data = reactive({
    accounts: undefined,
    prices: undefined,
    selectedDate: new Date(),
});

let sum = computed(() => {
  let sum = 0;
  if(!data.prices || !data?.accounts) {
    return 0;
  }
  Object.keys(data?.accounts).forEach(account => {
    if (!includeInSum.value.includes(account)) {
      return;
    }
    let acc = data.accounts[account];
    if (acc.currency.toUpperCase() !== "RUR") {
      sum += Number.parseFloat(data.accounts[account].value) * (data.prices?.[acc?.currency?.toUpperCase()]?.Value || 1);
      return;
    }
    sum += Number.parseFloat(data.accounts[account].value);
  });
  return sum.toLocaleString();
});

function send() {
    sendData(inputFormData);
}

function applySelected(account: any) {
  inputFormData.value = account.value;
  inputFormData.currency = account.currency;
  inputFormData.accountName = account.name;
}

function updateData() {
  getLatestData((latestData:any) => {
    data.accounts = latestData;
    includeInSum.value = Object.keys(data.accounts);
  });
}

getCurrencyPrices(new Date(), (newPrices) => {
  data.prices = newPrices;
});

function accountNameChanged() {
  if (inputFormData.accountName != selected.value.name) {
    selected.value = {};
  }
}

function getDataAtDateOfCapital() {
  data.prices = undefined;
  getDataAtDate(new Date(inputFormData.dateOfCapital), (result) => {
    data.accounts = result;
  });
  getCurrencyPrices(new Date(inputFormData.dateOfCapital), (newPrices) => {
    data.prices = newPrices;
  });
}

updateData();
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
