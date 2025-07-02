<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale
} from 'chart.js'
import type { ChartData } from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale
)

defineProps<{
  chartData: ChartData<'line'>;
}>();

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
}
</script>

<template>
    <Line :data="chartData" :options="chartOptions" />
</template>