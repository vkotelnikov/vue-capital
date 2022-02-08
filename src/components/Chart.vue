<template>
  <!-- <canvas id="myChart" ref="canvasRef" width="400" height="400"></canvas> -->
  <BarChart :chartData="chartData" :options="chartOptions"/>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps } from "vue";
import { BarChart, useBarChart } from "vue-chart-3";
import { Chart, ChartData, ChartOptions, registerables } from "chart.js";
Chart.register(...registerables);

const props = defineProps({
  accounts: Object
});

const chartData = {
      labels: Object.keys(props.accounts),
      datasets: [
        {
          label: "Капитал",
          data: Object.values(props.accounts).map(item => item.value),
          backgroundColor: ['#77CEFF', '#0079AF', '#123E6B', '#97B0C4', '#A5C8ED'],
        },
      ],
    };

const chartOptions = {
  plugins: {
    title: {
        display: true,
        text: 'Custom Chart Title'
    }
  }
}


</script>


<style scoped>
</style>
