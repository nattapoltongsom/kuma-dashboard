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
  CategoryScale,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import type { ChartData, ChartOptions } from 'chart.js'

// ลงทะเบียน plugin datalabels
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  ChartDataLabels
)

defineProps<{
  chartData: ChartData<'line'>;
}>()

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    y: {
      min: 0,
    },
  },
  plugins: {
    datalabels: {
      align: 'top',    // ให้ label อยู่เหนือจุด
      anchor: 'end',   // ติดปลายจุด (ถ้าชอบตรงกลางเปลี่ยนเป็น 'center')
      color: '#444',
      font: {
        weight: 'bold',
        size: 12,
      },
      formatter: (value: number) => value.toString(),
      offset: 4,       // เลื่อน label ขึ้นเล็กน้อยให้ไม่ชนจุด
    },
    legend: {
      display: true,
      position: 'bottom',  
    },
    tooltip: {
      enabled: true,
    },
  },
}
</script>

<template>
  <Line :data="chartData" :options="chartOptions" />
</template>