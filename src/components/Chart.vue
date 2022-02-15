<template>
  <BarChart :chartData="chartData" :options="chartOptions"/>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, computed, reactive } from "vue";
import { BarChart, useBarChart } from "vue-chart-3";
import { Chart, ChartData, ChartOptions, registerables } from "chart.js";
// @ts-ignore
import getCurrencyPrices from "./../functions/getCurrencyPrices";
Chart.register(...registerables);

const props = defineProps({
  accounts: Object,
  isLatest: {
    type: Boolean,
    default: false,
    required: false,
  }
});

let data = reactive({});
const chartData = computed(() => {
  data = {};

  for (const [key, item] of Object.entries(props.accounts)) {
    if (item.currency === "rur") {
      data[key] = item.value;
      continue;
    }
    getCurrencyPrices(props.isLatest ? new Date() : new Date(item.date)).then((res) => {
      let inRub = Number.parseFloat(item.value) * (res[item?.currency?.toUpperCase()]?.Value || 1);
      data[key] = inRub;
    });
  }

  return {
    datasets: [
      {
        label: "Капитал",
        data: data,
        backgroundColor: ['#77CEFF', '#0079AF', '#123E6B', '#97B0C4', '#A5C8ED'],
      },
    ],
  };
});

const chartOptions = {
  plugins: {
    title: {
        display: true,
        text: 'Капитал по счетам'
    }
  },
  interaction: {
    intersect: false,
    mode: "x",
  },
}

</script>


<style scoped>
</style>
