<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { fetchData } from '../services/googleSheetService';
import BarChart from '../components/BarChart.vue';
import PieChart from '../components/PieChart.vue';
import LineChart from '../components/LineChart.vue';
import type { ChartData } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

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
    totalReach: parseNumber(row[5]),
    totalLike: parseNumber(row[6]),
    totalComment: parseNumber(row[7]),
    totalShare: parseNumber(row[8]),
    totalEngagement: parseNumber(row[9]),
    avgCTR: parseNumber(row[10]),
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
    totalEngagement: campaigns.value.reduce((sum, c) => sum + c.totalEngagement, 0),
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

const exportCampaignSummaryPDF = async () => {
  try {
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 5;

    // ✅ หน้า 1: Summary cards + PieChart + Top 5
    const firstPageEl = document.querySelector('.pdf-export-container') as HTMLElement;
    if (!firstPageEl) {
      alert('ไม่พบ container สำหรับ export หน้าแรก');
      return;
    }

    const firstCanvas = await html2canvas(firstPageEl, { scale: 2 });
    const firstImg = firstCanvas.toDataURL('image/png');
    const firstImgProps = pdf.getImageProperties(firstImg);
    const firstImgWidth = pdfWidth - margin * 2;
    const firstImgHeight = (firstImgProps.height * firstImgWidth) / firstImgProps.width;

    pdf.addImage(firstImg, 'PNG', margin, margin, firstImgWidth, firstImgHeight);

    // ✅ หน้า 2: Charts (BarChart + LineChart)
    const chartSection = document.querySelector('.charts-row') as HTMLElement;
    if (!chartSection) {
      alert('ไม่พบ container สำหรับกราฟ');
      return;
    }

    pdf.addPage('a4', 'landscape');

    const chartCanvas = await html2canvas(chartSection, { scale: 2 });
    const chartImg = chartCanvas.toDataURL('image/png');
    const chartProps = pdf.getImageProperties(chartImg);
    const chartWidth = pdfWidth - margin * 2;
    const chartHeight = (chartProps.height * chartWidth) / chartProps.width;

    pdf.addImage(chartImg, 'PNG', margin, margin, chartWidth, chartHeight);

    // ✅ หน้า 3: ตารางข้อมูล
    pdf.addPage('a4', 'landscape');

    const head = [[
      'No.',
      'Name',
      'Total Kols',
      'Platform',
      'Total Reach',
      'Total Likes',
      'Total Comments',
      'Total Shares',
      'Total Engagement',
      'CTR (%)',
    ]];

    const body = campaigns.value.map(c => [
      c.no,
      c.campaignName,
      c.infoCount,
      c.platform,
      c.totalReach.toLocaleString(),
      c.totalLike.toLocaleString(),
      c.totalComment.toLocaleString(),
      c.totalShare.toLocaleString(),
      c.totalEngagement.toLocaleString(),
      c.avgCTR.toFixed(2),
    ]);

    autoTable(pdf, {
      head,
      body,
      startY: margin,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [100, 100, 255] },
      margin: { left: margin, right: margin },
      pageBreak: 'auto',
    });

    pdf.save('Campaigns_Summary_Report.pdf');
  } catch (error) {
    console.error('Export PDF failed:', error);
    alert('Export PDF ล้มเหลว กรุณาลองใหม่อีกครั้ง');
  }
};

</script>

<template>
  <div class="page-container">
    <h1>Campaigns Summary</h1>
    <div class="export-button-wrapper">
      <button @click="exportCampaignSummaryPDF" class="btn-export">Export Campaigns Summary PDF</button>
    </div>
    <div v-if="loading" class="loading">Loading Data...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error">
      <div class="pdf-export-container">
        <div class="summary-cards-grid">
          <div class="summary-card" style="border-top-color: var(--pastel-yellow);">
            <h3>Total Engagement</h3>
            <p class="summary-value">{{ totalSummary.totalEngagement.toLocaleString() }}</p>
          </div>
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
        <div class="grid-container top-rankings-grid">
          <div class="ranking-card">
            <h2>Engagement ratio</h2>
            <PieChart :chart-data="pieChartDataEngagementRatio" />
          </div>
          <div class="ranking-card">
            <h2>Top 5 Campaign by Engagement</h2>
            <router-link
                v-for="item in topByEngagement"
                :key="item.no"
                class="ranking-item"
                :to="`/campaign-${item.no}`"
              >
              <span class="name">{{ item.campaignName }}</span>
              <span class="value">{{ item.totalEngagement.toLocaleString() }}</span>
            </router-link>
          </div>
        </div>
      </div>  
    <div class="pdf-export-container">
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
              <th>CTR (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="campaign in campaigns" :key="campaign.no">
              <td>{{ campaign.no }}</td>
              <td>
                <router-link
                  :to="`/campaign-${campaign.no}`"
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
              <td>{{ campaign.avgCTR.toFixed(2) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style>
.export-button-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.btn-export {
  background-color: var(--pastel-green);
  color: var(--white);
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: var(--shadow);
}

.btn-export:hover {
  background-color: var(--pastel-mint);
  color: var(--text-dark);
}

.pdf-export-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  padding: 8px;
  background: white;
}

thead th {
  background-color: palevioletred;
  color: white;
  padding: 8px;
  text-align: center;
}

tbody td {
  border-bottom: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
</style>

