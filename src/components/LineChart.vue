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
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        autoSkip: false,  // เลือกว่าจะข้าม label หรือไม่
      },
    },
y: {
      min: 0,
      max: 20,  // กำหนด max เป็น 20
      ticks: {
        stepSize: 4, // ช่องไฟ 5 หน่วย
      },
    },
  },
  plugins: {
    datalabels: {
      align: 'end',
      anchor: 'end',
      color: '#444',
      font: {
        weight: 'bold',
        size: 12,
      },
      formatter: (value: number) => value.toString(),
      offset: 5,
      rotation: 320,
    },
    legend: {
      display: true,
      position: 'bottom' as const,
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