<script setup lang="ts">
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import type { ChartData, ChartOptions } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, ChartDataLabels)

defineProps<{
  chartData: ChartData<'pie'>
}>()

// ตัวเลือกของกราฟ
const chartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,      
      position: 'right',  
    },
    datalabels: {
      color: '#fff',
      font: {
        weight: 'bold',
        size: 14,
      },
      formatter: (value: number, context) => {
        const data = context.chart.data.datasets[0].data as number[]
        const total = data.reduce((a, b) => a + b, 0)
        const percentage = ((value / total) * 100).toFixed(1)
        return `${percentage}%`
      },
    },
  },
}
</script>

<template>
  <div style="width: 100%; height: 400px; margin: auto;">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>
