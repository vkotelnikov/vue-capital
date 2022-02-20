<template>
<hr>
  <div>Исторический график</div>
  <div class="row align-items-center">
    <label for="dateFrom" class="col-3 col-lg-1 col-form-label">Дата от</label>
    <div class="col-auto col-lg-2 px-0">
      <input id="dateFrom" type="date" class="form-control form-control-sm" v-model="data.startDate" :max="data.endDate"/>
    </div>
    <label for="dateTo" class="col-1 col-lg-auto col-form-label">до</label>
    <div class="col-4 col-lg-2">
      <input id="dateTo" type="date" class="form-control form-control-sm" v-model="data.endDate" :min="data.startDate" :max="maxDate"/>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <button type="button" class="btn btn-primary" @click="updateData" :disabled="data.chartIsLoading">Построить график <span v-show="data.chartIsLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span></button>
    </div>
  </div>
  <LineChart ref="lineChart" :chartData="chartData" :options="chartOptions"/>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, reactive, computed } from "vue";
import { LineChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";
import 'chartjs-adapter-moment';
// @ts-ignore
import getPeriodicData from "./../functions/getPeriodicData";
import currentTime from "./../functions/getCurrentTime";
// @ts-ignore
import getCurrencyPrices from "./../functions/getCurrencyPrices";

Chart.register(...registerables);

let maxDate = currentTime.getStandardDateString(new Date());

const chartData = {};

const lineChart = ref();

const data = reactive({
  startDate: undefined,
  endDate: maxDate,
  datePoints: {},
  chartIsLoading: false,
});

const COLORS = [
  'rgba(255, 77, 77, 0.4)',
  'rgba(255, 210, 77, 0.4)',
  'rgba(210, 255, 77, 0.4)',
  'rgba(77, 255, 255, 0.4)',
  'rgba(77, 121, 255, 0.4)',
  'rgba(210, 77, 255, 0.4)',
  'rgba(255, 160, 255, 0.4)',

];

const chartOptions = {
  animation: false,
  parsing: false,
  normalized: true,
  scales: {
    y: {
      min:0,
      stacked: true,
    },
    x: {
      type: "time",
      time: {
        unit: "day",
        ticks: {
          source: 'auto',
          // Disabled rotation for performance
          maxRotation: 0,
          autoSkip: true,
        },
      },
      // samples: 10,
      // ticks: {
      //   // Include a dollar sign in the ticks
      //   callback: function(value, index, ticks) {
      //       return '$' + Object.keys(data.datePoints)[index];
      //   },
      // }
    }
  },
  elements: {
    point: {
      radius: 1,
    }
  },
  plugins: {
    decimation: {
      enabled: true,
      algorithm: "lttb",
      samples: 60,
      threshold: 35
    },
    title: {
        display: true,
        text: "Исторический график"
    },
    tooltip: {
      position: "nearest",
    },
  },
  interaction: {
    intersect: false,
    mode: "x",
  },
}

async function loadPrices(result) {
  for (const date of Object.values(result)) {
    const values = Object.values(date);
    if (values.some((acc) => acc.currency !== "RUR")) {
      let currRes = await getCurrencyPrices(new Date(values[0].date.seconds * 1000));
      for (const account of values) {
        if (account.currency != "RUR") {
          account.value *= currRes[account.currency].Value;
        }
      }
    }
  }
}

async function updateData() {
  // console.log("datapoints", data.datePoints);
  if (! (data.startDate && data.endDate)) {
    return;
  }
  data.chartIsLoading = true;
  let leadLabelDate = currentTime.getTimeFromString(data.startDate);
  data.datePoints = {};
  while(leadLabelDate <= currentTime.getTimeFromString(data.endDate)) {
    data.datePoints[currentTime.getStandardDateString(leadLabelDate)] = {};
    leadLabelDate.setDate(leadLabelDate.getDate() + 1);
  }
  const result = await getPeriodicData(currentTime.getTimeFromString(data.startDate), currentTime.getTimeFromString(data.endDate));
    
  // if(result) return console.log("resSS", result);

  await loadPrices(result);

  let accounts = {};
  let newDatasets = {};
// console.log("keys",Object.keys(data.datePoints));
  let colorIndex = 0;
  Object.keys(data.datePoints).forEach(datePoint => {

    if(result[datePoint]) {
      Object.keys(result[datePoint]).forEach(acc => {
        accounts[acc] = result[datePoint][acc];
      });
    }
    
    Object.keys(accounts).forEach(accountName => {

      if(!newDatasets[accountName]) {
        newDatasets[accountName] = {
          label: accountName,
          borderColor: COLORS[colorIndex],
          backgroundColor: COLORS[colorIndex],
          fill: "stack",
          borderWidth: 1,
          spanGaps: true,
          data: []
        };
        colorIndex++;
      }
      newDatasets[accountName]["data"].push({
        x: currentTime.getTimeFromString(datePoint).getTime(), 
        y: Number.parseFloat(accounts[accountName].value)
      });
    });
  });
  chartData.datasets = Object.values(newDatasets);
  refreshChart();
  data.chartIsLoading = false;
}

function refreshChart() {
  lineChart.value.chartInstance.destroy();
  lineChart.value.renderChart();
}

</script>


<style scoped>
</style>
