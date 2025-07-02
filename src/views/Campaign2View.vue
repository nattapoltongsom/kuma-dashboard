<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { fetchData } from '../services/googleSheetService';
import BarChart from '../components/BarChart.vue';
import PieChart from '../components/PieChart.vue';
import LineChart from '../components/LineChart.vue';
import type { ChartData } from 'chart.js';

// ---- Data Structure Interface ----
interface KOLPerformance {
  no: number;
  kolName: string;
  follower: number;
  platform: string;
  type: string;
  link: string;
  reach: number;
  like: number;
  comment: number;
  share: number;
  ctr: number;
  totalEngagement: number;
  engagementRateByFollower: number;
  engagementRateByReach: number;
}

// ---- Component State ----
const loading = ref(true);
const error = ref<string | null>(null);
const kols = ref<KOLPerformance[]>([]);

// ---- Data Processing ----
const parseNumber = (text: string) => parseFloat(text.replace(/,|%/g, '')) || 0;

const processData = (data: string[][]) => {
  const headers = data[0];
  const rows = data.slice(1);
  console.log("rows" , rows)
  kols.value = rows.map(row => ({
    no: parseInt(row[0]),
    kolName: row[1],
    follower: parseNumber(row[2]),
    platform: row[3],
    type: row[4],
    link: row[5],
    reach: parseNumber(row[6]),
    like: parseNumber(row[7]),
    comment: parseNumber(row[8]),
    share: parseNumber(row[9]),
    ctr: parseNumber(row[10]),
    totalEngagement: parseNumber(row[11]),
    engagementRateByFollower: parseNumber(row[12]),
    engagementRateByReach: parseNumber(row[13]),
  }));
};

// ---- Top 5 Rankings (Computed Properties) ----
const topKOLsByEngagementRate = computed(() =>
  [...kols.value]
    .sort((a, b) => b.engagementRateByReach - a.engagementRateByReach)
    .slice(0, 5)
);

const topKOLsByReach = computed(() =>
  [...kols.value]
    .sort((a, b) => b.reach - a.reach)
    .slice(0, 5)
);

const topKOLsByCTR = computed(() =>
  [...kols.value]
    .sort((a, b) => b.ctr - a.ctr)
    .slice(0, 5)
);

// ---- Chart Data (Computed Properties) ----
const barChartData = computed<ChartData<'bar'>>(() => ({
  labels: kols.value.map(k => k.kolName),
  datasets: [
    { label: 'Total Engagement', data: kols.value.map(k => k.totalEngagement), backgroundColor: '#36A2EB' },
    { label: 'Reach', data: kols.value.map(k => k.reach), backgroundColor: '#4BC0C0' },
  ]
}));

const pieChartData = computed<ChartData<'pie'>>(() => ({
  labels: kols.value.map(k => k.kolName),
  datasets: [{
    label: 'Total Engagement',
    data: kols.value.map(k => k.totalEngagement),
    backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16', '#FDB45C', '#949FB1'],
  }]
}));

const lineChartData = computed<ChartData<'line'>>(() => ({
  labels: kols.value.map(k => k.kolName),
  datasets: [{
    label: 'Engagement Rate by Reach (%)',
    data: kols.value.map(k => k.engagementRateByReach),
    borderColor: '#42b983',
    tension: 0.1
  }]
}));


// ---- Lifecycle Hook ----
onMounted(async () => {
  try {
    loading.value = true;
    // **** เปลี่ยน 'Campaign 1' เป็นชื่อชีตของคุณ ****
    const data = await fetchData('Campaign 2'); 
    console.log("data" , data)
    if (data && data.length > 1) {
      processData(data);
    } else {
      error.value = 'No data found.';
    }
  } catch (err) {
    console.log("Failed to load data." , err)
    error.value = 'Failed to load data.';
  } finally {
    loading.value = false;
  }
});

</script>

<template>
  <div class="page-container">
    <h1>Campaign 1 Details</h1> <div v-if="loading" class="loading">Loading Data...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error">
      <div class="grid-container">
        <div class="table-container">
          <h2>🏆 Top 5 KOLs by Engagement Rate</h2>
          <table>
            <thead>
              <tr><th>KOL</th><th>Rate by Reach</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in topKOLsByEngagementRate" :key="item.no">
                <td>{{ item.kolName }}</td>
                <td>{{ item.engagementRateByReach.toFixed(2) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-container">
          <h2>🚀 Top 5 KOLs by Reach</h2>
          <table>
            <thead>
              <tr><th>KOL</th><th>Reach</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in topKOLsByReach" :key="item.no">
                <td>{{ item.kolName }}</td>
                <td>{{ item.reach.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-container">
          <h2>🎯 Top 5 KOLs by CTR</h2>
          <table>
            <thead>
              <tr><th>KOL</th><th>CTR</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in topKOLsByCTR" :key="item.no">
                <td>{{ item.kolName }}</td>
                <td>{{ item.ctr.toFixed(2) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid-container">
        <div class="chart-container">
          <h2>KOLs Metrics (Bar)</h2>
          <BarChart :chart-data="barChartData" />
        </div>
        <div class="chart-container">
          <h2>Engagement Proportion (Pie)</h2>
          <PieChart :chart-data="pieChartData" />
        </div>
      </div>
      <div class="chart-container" style="margin-top: 2rem;">
        <h2>KOLs Engagement Rate Trend (Line)</h2>
        <LineChart :chart-data="lineChartData" />
      </div>
      <div class="grid-container">
      </div>
      <div class="table-container">
        <h2>📊 All KOL Performance Data</h2>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>KOL Name</th>
              <th>Followers</th>
              <th>Platform</th>
              <th>Type</th>
              <th>Reach</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Shares</th>
              <th>CTR (%)</th>
              <th>Total Engagement</th>
              <th>ER by Follower (%)</th>
              <th>ER by Reach (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="kol in kols" :key="kol.no">
              <td>{{ kol.no }}</td>
              <td>{{ kol.kolName }}</td>
              <td>{{ kol.follower.toLocaleString() }}</td>
              <td>{{ kol.platform }}</td>
              <td>{{ kol.type }}</td>
              <td>{{ kol.reach.toLocaleString() }}</td>
              <td>{{ kol.like.toLocaleString() }}</td>
              <td>{{ kol.comment.toLocaleString() }}</td>
              <td>{{ kol.share.toLocaleString() }}</td>
              <td>{{ kol.ctr.toFixed(2) }}</td>
              <td>{{ kol.totalEngagement.toLocaleString() }}</td>
              <td>{{ kol.engagementRateByFollower.toFixed(2) }}</td>
              <td>{{ kol.engagementRateByReach.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>