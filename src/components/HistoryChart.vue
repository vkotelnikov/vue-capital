<template>
  Дата начала<input type="date" v-model="data.startDate" @change="updateData"/>
  Дата окончания<input type="date" v-model="data.endDate" @change="updateData"/>
  <LineChart :chartData="chartData" :options="chartOptions"/>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, reactive, computed } from "vue";
import { LineChart} from "vue-chart-3";
import { Chart, registerables } from "chart.js";
// @ts-ignore
import getPeriodicData from "./../functions/getPeriodicData";

Chart.register(...registerables);

const data = reactive({
  startDate: undefined,
  endDate: new Date().toISOString().replace(/T.*/,'').split('-').join('-'),
  result: {},
  datePoints: {},
  accountsByDate: {},
  accountDatasets: {},
});



const chartData = computed(() => {
      return {
        labels: Object.keys(data.datePoints),
        datasets: Object.values(data.accountDatasets),
      }
    });

const chartOptions = {
  scales: {
    y: {
      min:0,
      stacked: true,
    }
  },
  plugins: {
    // filler: {
    //   propagate: false
    // },
    // 'samples-filler-analyser': {
    //   target: 'chart-analyser'
    // },
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

function updateData() {
  let leadLabelDate = new Date(data.startDate);
  data.datePoints = {};
  while(leadLabelDate <= new Date(data.endDate)) {
    data.datePoints[(leadLabelDate.toISOString().replace(/T.*/,'').split('-').join('-'))] = {};
    leadLabelDate.setDate(leadLabelDate.getDate()+1);
  }
  getPeriodicData((result, accountNames) => {
    // data.result = result;
    
    // if(result) return console.log("resSS", result);
    let accounts = {};
    // accountNames.forEach(key => accounts[key] = {currency: "rur", value: 0});
    // console.log("spread", accounts);
    let newDatasets = {};
// console.log("keys",Object.keys(data.datePoints));
    Object.keys(data.datePoints).forEach(datePoint => {

      if(result[datePoint]) {
        Object.keys(result[datePoint]).forEach(acc => {
          accounts[acc] = result[datePoint][acc];
        });
      }
      
      Object.keys(accounts).forEach(accountName => {

        if(!newDatasets[accountName]) {
          let color = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`;
          newDatasets[accountName] = {
            label: accountName,
            borderColor: color,
            backgroundColor: color,
            fill: "stack",
            spanGaps: true,
            data: []
          };
        }
        let dataPoints = [];
        dataPoints.push({x: datePoint, y: accounts[accountName].value});
        newDatasets[accountName]["data"].push({x: datePoint, y: accounts[accountName].value});
      });
    });
    data.accountDatasets = newDatasets;
  }, new Date(data.startDate), data.endDate && new Date(data.endDate));
}

</script>


<style scoped>
</style>
