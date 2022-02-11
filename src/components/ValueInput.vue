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
                <option v-for="(acc, key) in data.accounts" :value="key">{{key}}</option>
            </select>
        </div>
        <div>Сумма<input type="text" required v-model="inputFormData.value" @input="valueChanged"/>
            Валюта
            <select v-model="inputFormData.currency" :disabled="inputFormData.accountName === selected">
                <option v-for="(curr, key) in currency" :value="key" required>{{curr}}</option>
            </select>
        </div>
        <div><input type="submit" :value="inputFormData.accountName === selected ? 'Сохранить' : 'Создать новую запись'" /></div>
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
    selected.value = inputFormData.accountName;
}

function applySelected(account: any) {
  inputFormData.value = data.accounts[account].value;
  inputFormData.currency = data.accounts[account].currency;
  inputFormData.accountName = account;
}

function dataLoadCallback(result) {
    data.accounts = result;
    includeInSum.value = Object.keys(data.accounts);
}

getCurrencyPrices(new Date(), (newPrices) => {
  data.prices = newPrices;
});

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
  data.prices = undefined;
  getDataAtDate(new Date(inputFormData.dateOfCapital), dataLoadCallback);
  getCurrencyPrices(new Date(inputFormData.dateOfCapital), (newPrices) => {
    data.prices = newPrices;
  });
}

function valueChanged() {
  inputFormData.value = Number.parseFloat(inputFormData.value) >= 0 ? Number.parseFloat(inputFormData.value) : undefined;
}

getDataAtDate(new Date(), dataLoadCallback);
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
