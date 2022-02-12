<template>
<hr>
  <div>Исторический график</div>
  <div class="row align-items-center">
    <label for="dateFrom" class="col-3 col-lg-1 col-form-label">Дата от</label>
    <div class="col-auto col-lg-2 px-0">
      <input id="dateFrom" type="date" class="form-control form-control-sm" v-model="data.startDate" @change="updateData"/>
    </div>
    <label for="dateTo" class="col-1 col-lg-auto col-form-label">до</label>
    <div class="col-4 col-lg-2">
      <input id="dateTo" type="date" class="form-control form-control-sm" v-model="data.endDate" :max="maxDate" @change="updateData"/>
    </div>
  </div>
  <LineChart :chartData="chartData" :options="chartOptions"/>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, reactive, computed } from "vue";
import { LineChart} from "vue-chart-3";
import { Chart, registerables } from "chart.js";
import 'chartjs-adapter-moment';
// @ts-ignore
import getPeriodicData from "./../functions/getPeriodicData";

Chart.register(...registerables);

let maxDate = new Date().toISOString().replace(/T.*/,'').split('-').join('-');

const data = reactive({
  startDate: undefined,
  endDate: maxDate,
  result: {},
  datePoints: {},
  accountsByDate: {},
  accountDatasets: {},
});


const COLORS = [
  'rgba(255, 99, 132, 0.3)',
  'rgba(255, 159, 64, 0.3)',
  'rgba(255, 205, 86, 0.3)',
  'rgba(75, 192, 192, 0.3)',
  'rgba(54, 162, 235, 0.3)',
  'rgba(153, 102, 255, 0.3)',
  'rgba(201, 203, 207, 0.3)'
];

let tzoffset = new Date().getTimezoneOffset() * 60000; 

const chartData = computed(() => {
  return {
    // labels: Object.keys(data.datePoints).map(dp => new Date(dp).getTime()),
    datasets: Object.values(data.accountDatasets),
  }
});

const chartOptions = {
  animation: false,
  parsing: false,

  scales: {
    y: {
      min:0,
      stacked: true,
    },
    x: {
      type: "time",
      time: {
        unit: "day"
      },
      samples: 30,
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
    // decimation: {
    //   enabled: true,
    //   type: "lttb",
    //   samples: 30,
    //   threshold: 30
    // },
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
  if (! (data.startDate && data.endDate)) {
    return;
  }
  getPeriodicData((result, accountNames) => {
    // data.result = result;
    
    // if(result) return console.log("resSS", result);
    let accounts = {};
    // accountNames.forEach(key => accounts[key] = {currency: "rur", value: 0});
    // console.log("spread", accounts);
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
          // let color = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`;
          newDatasets[accountName] = {
            label: accountName,
            borderColor: COLORS[colorIndex],
            backgroundColor: COLORS[colorIndex],
            fill: "stack",
            borderWidth: 1,
            spanGaps: true,
            parsing: false,
            data: []
          };
          colorIndex++;
        }
        newDatasets[accountName]["data"].push({x: new Date(datePoint).getTime() - (3 * 3600000), y: Number.parseFloat(accounts[accountName].value)});
      });
    });
    data.accountDatasets = newDatasets;
  }, new Date(data.startDate), data.endDate && new Date(data.endDate));
}

</script>


<style scoped>
</style>
