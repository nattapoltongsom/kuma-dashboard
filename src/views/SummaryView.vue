<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { fetchData } from '../services/googleSheetService';
import BarChart from '../components/BarChart.vue';
import PieChart from '../components/PieChart.vue';
import LineChart from '../components/LineChart.vue';
import type { ChartData } from 'chart.js';

interface CampaignSummary {
  no: number;
  campaignName: string;
  infoCount: number;
  platform: string;
  totalReach: number;
  totalLike: number;
  totalComment: number;
  totalShare: number;
  avgCTR: number;
  totalEngagement: number;
  engagementRateByReach: number;
}

// ---- Component State ----
const loading = ref(true);
const error = ref<string | null>(null);
const campaigns = ref<CampaignSummary[]>([]);

// ---- Data Processing ----
// ฟังก์ชันแปลงข้อมูล string จาก CSV ให้เป็น number และจัดการกับ '%'
const parseNumber = (text: string) => parseFloat(text.replace(/,|%/g, '')) || 0;

const processData = (data: string[][]) => {
  console.log("data" ,data)
  const headers = data[0];
  const rows = data.slice(0);

  campaigns.value = rows.map(row => ({
    no: parseInt(row[0]),
    campaignName: row[1],
    infoCount: parseInt(row[2]),
    platform: row[3],
    // ข้ามคอลัมน์ "ดูรายละเอียด" ที่ index 4
    totalReach: parseNumber(row[5]),
    totalLike: parseNumber(row[6]),
    totalComment: parseNumber(row[7]),
    totalShare: parseNumber(row[8]),
    avgCTR: parseNumber(row[9]),
    totalEngagement: parseNumber(row[10]),
    engagementRateByReach: parseNumber(row[11]),
  }));
};

// ---- Top 5 Rankings (Computed Properties) ----
const topByEngagement = computed(() => 
  [...campaigns.value]
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, 5)
);

const totalSummary = computed(() => {
  return {
    totalReach: campaigns.value.reduce((sum, c) => sum + c.totalReach, 0),
    totalLike: campaigns.value.reduce((sum, c) => sum + c.totalLike, 0),
    totalComment: campaigns.value.reduce((sum, c) => sum + c.totalComment, 0),
    totalShare: campaigns.value.reduce((sum, c) => sum + c.totalShare, 0),
  };
});

const barChartData = computed<ChartData<'bar'>>(() => ({
  labels: campaigns.value.map(c => c.campaignName),
  datasets: [
    { label: 'Engagement', data: campaigns.value.map(c => c.totalEngagement), backgroundColor: '#36A2EB' },
    { label: 'Reach', data: campaigns.value.map(c => c.totalReach), backgroundColor: '#4BC0C0' },
    { label: 'Comment', data: campaigns.value.map(c => c.totalComment), backgroundColor: '#FFCE56' },
    { label: 'Like', data: campaigns.value.map(c => c.totalLike), backgroundColor: '#FF9F40' },
    { label: 'Share', data: campaigns.value.map(c => c.totalShare), backgroundColor: '#FF6384' },
  ]
}));

const pieChartDataEngagementRatio = computed<ChartData<'pie'>>(() => ({
  labels: campaigns.value.map(c => c.campaignName),
  datasets: [{
    label: 'Total Engagement',
    data: campaigns.value.map(c => c.totalEngagement),
    backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16', '#FDB45C'],
  }]
}));

const avgCTRChartData = computed<ChartData<'line'>>(() => ({ 
  labels: campaigns.value.map(c => c.campaignName),
  datasets: [{
    label: 'CTR(%)',
    data: campaigns.value.map(c => c.avgCTR),
    borderColor: '#FF6384', 
    tension: 0.3 
  }]
}));

onMounted(async () => {
  try {
    loading.value = true;
    const data = await fetchData('Summary'); 
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
    <h1>Campaigns Summary</h1>
    <div v-if="loading" class="loading">Loading Data...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error">
      <div class="grid-container top-rankings-grid">
        <div class="ranking-card">
          <h2>Top 5 Engagement ratio</h2>
          <PieChart :chart-data="pieChartDataEngagementRatio" />
        </div>
        <div class="ranking-card">
          <h2>Top 5 Campaign by Engagement</h2>
          <router-link
              v-for="item in topByEngagement"
              :key="item.no"
              class="ranking-item"
              :to="`/${item.campaignName.toLowerCase().replace(/\s+/g, '-')}`"
            >
            <span class="name">{{ item.campaignName }}</span>
            <span class="value">{{ item.totalEngagement.toLocaleString() }}</span>
          </router-link>
        </div>
      </div>

      <div class="grid-container charts-row">
        <div class="chart-container">
          <h2>Total by campaign</h2>
          <BarChart :chart-data="barChartData" />
        </div>
        <div class="chart-container">
          <h2>CTR (%) by campaign</h2>
          <LineChart :chart-data="avgCTRChartData" /> 
        </div>
      </div>

      <div class="summary-cards-grid">
        <div class="summary-card" style="border-top-color: var(--pastel-green);">
          <h3>Total Reach</h3>
          <p class="summary-value">{{ totalSummary.totalReach.toLocaleString() }}</p>
        </div>
        <div class="summary-card" style="border-top-color: var(--pastel-blue);">
          <h3>Total Likes</h3>
          <p class="summary-value">{{ totalSummary.totalLike.toLocaleString() }}</p>
        </div>
        <div class="summary-card" style="border-top-color: var(--pastel-pink);">
          <h3>Total Comments</h3>
          <p class="summary-value">{{ totalSummary.totalComment.toLocaleString() }}</p>
        </div>
        <div class="summary-card" style="border-top-color: var(--pastel-yellow);">
          <h3>Total Shares</h3>
          <p class="summary-value">{{ totalSummary.totalShare.toLocaleString() }}</p>
        </div>
      </div>
      
      <div class="table-container">
        <h2>Campaign Data</h2>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Name</th>
              <th>Total Kols</th>
              <th>Platform</th>
              <th>Total Reach</th>
              <th>Total Likes</th>
              <th>Total Comments</th>
              <th>Total Shares</th>
              <th>Total Engagement</th>
              <th>ER by Reach (%)</th>
              <th>CTR (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="campaign in campaigns" :key="campaign.no">
              <td>{{ campaign.no }}</td>
              <td>
                <router-link
                  :to="`/${campaign.campaignName.toLowerCase().replace(/\s+/g, '-')}`"
                  class="campaign-link"
                >
                  {{ campaign.campaignName }}
                </router-link>
              </td>
              <td>{{ campaign.infoCount }}</td>
              <td>{{ campaign.platform }}</td>
              <td>{{ campaign.totalReach.toLocaleString() }}</td>
              <td>{{ campaign.totalLike.toLocaleString() }}</td>
              <td>{{ campaign.totalComment.toLocaleString() }}</td>
              <td>{{ campaign.totalShare.toLocaleString() }}</td>
              <td>{{ campaign.totalEngagement.toLocaleString() }}</td>
              <td>{{ campaign.engagementRateByReach.toFixed(2) }}%</td>
              <td>{{ campaign.avgCTR.toFixed(2) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>