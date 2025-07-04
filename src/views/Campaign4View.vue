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

interface KolSummary {
  type: string;
  totalReach: number;
  totalLike: number;
  totalComment: number;
  totalShare: number;
  totalEngagement: number;
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

const groupedByType = computed<KolSummary[]>(() => {
  const groups: Record<string, KolSummary> = {};

  for (const kol of kols.value) {
    if (!groups[kol.type]) {
      groups[kol.type] = {
        type: kol.type,
        totalReach: 0,
        totalLike: 0,
        totalComment: 0,
        totalShare: 0,
        totalEngagement: 0,
      };
    }

    groups[kol.type].totalReach += kol.reach;
    groups[kol.type].totalLike += kol.like;
    groups[kol.type].totalComment += kol.comment;
    groups[kol.type].totalShare += kol.share;
    groups[kol.type].totalEngagement += kol.totalEngagement;
  }

  return Object.values(groups);
});


// ---- Top 5 Rankings (Computed Properties) ----
const topKOLsByEngagement = computed(() =>
  [...kols.value]
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, 5)
);

const topEngagementRateByFollower = computed(() =>
  [...kols.value]
    .sort((a, b) => b.engagementRateByFollower - a.engagementRateByFollower)
    .slice(0, 5)
);

const topEngagementRateByReach = computed(() =>
  [...kols.value]
    .sort((a, b) => b.engagementRateByReach - a.engagementRateByReach)
    .slice(0, 5)
);

// ---- Chart Data (Computed Properties) ----
const barChartDataTotal = computed<ChartData<'bar'>>(() => {
  const labels = groupedByType.value.map(g => g.type);
  return {
    labels,
    datasets: [
      {
        label: 'Total Reach',
        backgroundColor: '#4BC0C0',
        data: groupedByType.value.map(g => g.totalReach),
      },
      {
        label: 'Total Like',
        backgroundColor: '#FFCE56',
        data: groupedByType.value.map(g => g.totalLike),
      },
      {
        label: 'Total Comment',
        backgroundColor: '#FF6384',
        data: groupedByType.value.map(g => g.totalComment),
      },
      {
        label: 'Total Share',
        backgroundColor: '#9966FF',
        data: groupedByType.value.map(g => g.totalShare),
      },
    ],
  };
});

const barChartDataTotalEngagement = computed<ChartData<'bar'>>(() => {
  const labels = groupedByType.value.map(g => g.type);
  return {
    labels,
    datasets: [
      {
        label: 'Total Engagement',
        backgroundColor: '#FFCE56',
        data: groupedByType.value.map(g => g.totalEngagement),
      }
    ],
  };
});

const pieChartDataType = computed<ChartData<'pie'>>(() => {
  const groupMap: Record<string, number> = {};

  for (const kol of kols.value) {
    if (!groupMap[kol.type]) {
      groupMap[kol.type] = 0;
    }
    groupMap[kol.type] += 1; // นับจำนวน KOL ต่อ type
  }

  const labels = Object.keys(groupMap);    // เช่น ['Micro', 'Macro', 'Mega']
  const data = Object.values(groupMap);    // เช่น [5, 10, 2]

  return {
    labels,
    datasets: [{
      label: 'Number of KOLs by Type',
      data,
      backgroundColor: [
        '#41B883',
        '#E46651',
        '#00D8FF',
        '#DD1B16',
        '#FDB45C',
        '#949FB1'
      ]
    }]
  };
});

const lineChartDataAvgCTRByType = computed<ChartData<'line'>>(() => {
  const groupMap: Record<string, { sum: number; count: number }> = {};

  for (const kol of kols.value) {
    if (!groupMap[kol.type]) {
      groupMap[kol.type] = { sum: 0, count: 0 };
    }
    groupMap[kol.type].sum += kol.ctr;
    groupMap[kol.type].count += 1;
  }

  const labels = Object.keys(groupMap);
  const data = labels.map(type => {
    const { sum, count } = groupMap[type];
    return count > 0 ? sum / count : 0;
  });

  return {
    labels,
    datasets: [{
      label: 'Average CTR (%) per Type',
      data,
      borderColor: '#ff6384',
      backgroundColor: '#ffb1c1',
      tension: 0.1
    }]
  };
});

const currentPage = ref(1);
const pageSize = 10;

const totalPages = computed(() => Math.ceil(kols.value.length / pageSize));

const paginatedKols = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return kols.value.slice(start, start + pageSize);
});


// ---- Lifecycle Hook ----
onMounted(async () => {
  try {
    loading.value = true;
    // **** เปลี่ยน 'Campaign 1' เป็นชื่อชีตของคุณ ****
    const data = await fetchData('Campaign 4'); 
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
    <h1>Campaign 4 Details</h1>
    <div v-if="loading" class="loading">Loading Data...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error">
      <div class="grid-container top-rankings-grid">
        <div class="ranking-card">
          <h2>Top 5 KOLs by Engagement</h2>
          <div class="ranking-item" v-for="item in topKOLsByEngagement" :key="item.no">
            <span class="name">{{ item.kolName }}</span>
            <span class="value">{{ item.totalEngagement.toLocaleString() }}</span>
          </div>
        </div>
        <div class="ranking-card">
          <h2>Top 5 Engagement rate by follow</h2>
          <div class="ranking-item" v-for="item in topEngagementRateByFollower" :key="item.no">
            <span class="name">{{ item.kolName }}</span>
            <span class="value">{{ item.engagementRateByFollower.toFixed(2) }}%</span>
          </div>
        </div>
        <div class="ranking-card">
          <h2>Top 5 Engagement rate by reach</h2>
          <div class="ranking-item" v-for="item in topEngagementRateByReach" :key="item.no">
            <span class="name">{{ item.kolName }}</span>
            <span class="value">{{ item.engagementRateByReach.toFixed(2) }}%</span>
          </div>
        </div>
      </div>

      <div class="grid-container charts-row">
        <div class="chart-container">
          <h2>KOL Type</h2>
          <PieChart :chart-data="pieChartDataType" />
        </div>
        <div class="chart-container">
          <h2>Total Engagement</h2>
          <BarChart :chart-data="barChartDataTotalEngagement" />
        </div>
      </div>
      
      <div class="grid-container charts-row">
        <div class="chart-container">
          <h2>Total Reach, Like, Share, Comment</h2>
          <BarChart :chart-data="barChartDataTotal" />
        </div>
        <div class="chart-container">
          <h2>Average CTR (%) by KOL Type</h2>
          <LineChart :chart-data="lineChartDataAvgCTRByType" />
        </div>
      </div>
      
      <div class="table-container">
        <h2>All KOL Performance Data</h2>
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
            <tr v-for="kol in paginatedKols" :key="kol.no">
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
        <div class="pagination">
          <button @click="currentPage--" :disabled="currentPage === 1">Prev</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="currentPage++" :disabled="currentPage === totalPages">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>