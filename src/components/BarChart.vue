<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import type { ChartData } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

defineProps<{
  chartData: ChartData<'bar'>;
}>();

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
    },
    datalabels: {
      display: false,
    },
  },
};
</script>

<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>
