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
  layout: {
    padding: {
      top: 40  // เพิ่ม padding ด้านบนเพื่อให้ label ไม่โดนตัด
    }
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        autoSkip: false,
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
    },
    datalabels: {
      display: true,
      anchor: 'end',
      align: 'end',
      offset: 5,
      rotation: 320,
      font: {
        weight: 'bold',
        size: 12
      }
    }
  },
};
</script>

<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>
