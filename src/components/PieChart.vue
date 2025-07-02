<script setup lang="ts">
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js'
import type { ChartData } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)

defineProps<{
  chartData: ChartData<'pie'>;
}>();

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true
}
</script>

<template>
  <div style="max-height: 400px; max-width: 400px; margin: auto;"> <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>
