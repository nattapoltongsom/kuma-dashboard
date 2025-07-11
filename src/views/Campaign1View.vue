<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { fetchData } from '../services/googleSheetService';
import BarChart from '../components/BarChart.vue';
import LineChart from '../components/LineChart.vue';
import type { ChartData } from 'chart.js';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

interface KOLPerformance {
  no: number;
  kolName: string;
  follower: number;
  platform: string;
  link: string;
  reach: number;
  like: number;
  comment: number;
  share: number;
  ctr: number;
  totalEngagement: number;
}

const loading = ref(true);
const error = ref<string | null>(null);
const kols = ref<KOLPerformance[]>([]);

const parseNumber = (text: string) => parseFloat(text.replace(/,|%/g, '')) || 0;

const processData = (data: string[][]) => {
  const rows = data.slice(0);
  kols.value = rows.map(row => ({
    no: parseInt(row[0]),
    kolName: row[1],
    follower: parseNumber(row[2]),
    platform: row[3],
    link: row[4],
    reach: parseNumber(row[5]),
    like: parseNumber(row[6]),
    comment: parseNumber(row[7]),
    share: parseNumber(row[8]),
    totalEngagement: parseNumber(row[9]),
    ctr: parseNumber(row[10]),
  }));
};

const topKOLsByEngagement = computed(() =>
  [...kols.value].sort((a, b) => b.totalEngagement - a.totalEngagement).slice(0, 5)
);

const colorPalette = [
  '#b8e0d2', '#d6eaff', '#ffd6e0', '#e8d6ff', '#fff2d6', '#d6f5e8',
];

const barChartDataKolEngagement = computed<ChartData<'bar'>>(() => ({
  labels: kols.value.map(g => g.kolName),
  datasets: [{
    label: 'Total Engagement',
    backgroundColor: colorPalette,
    data: kols.value.map(g => g.totalEngagement),
  }],
}));

const lineChartDataKolCTR = computed<ChartData<'line'>>(() => ({
  labels: kols.value.map(g => g.kolName),
  datasets: [{
    label: 'CTR (%)',
    data: kols.value.map(g => g.ctr),
    borderColor: '#ff6384',
    backgroundColor: '#ffb1c1',
    tension: 0.1,
  }],
}));

const totalSummary = computed(() => ({
  totalReach: kols.value.reduce((sum, c) => sum + c.reach, 0),
  totalLike: kols.value.reduce((sum, c) => sum + c.like, 0),
  totalComment: kols.value.reduce((sum, c) => sum + c.comment, 0),
  totalShare: kols.value.reduce((sum, c) => sum + c.share, 0),
  totalEngagement: kols.value.reduce((sum, c) => sum + c.totalEngagement, 0),
}));

onMounted(async () => {
  try {
    loading.value = true;
    const data = await fetchData('Campaign 1');
    if (data && data.length > 1) {
      processData(data);
    } else {
      error.value = 'No data found.';
    }
  } catch {
    error.value = 'Failed to load data.';
  } finally {
    loading.value = false;
  }
});

const exportFullPagePDF = async () => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();

    // หน้า 1: summary + top 5
    const summaryAndTop5El = document.querySelector('#summary-and-top5') as HTMLElement | null;
    if (!summaryAndTop5El) {
      alert('ไม่พบส่วน summary และ top 5');
      return;
    }
    const canvasSummaryTop5 = await html2canvas(summaryAndTop5El, { scale: 2 });
    const imgDataSummaryTop5 = canvasSummaryTop5.toDataURL('image/png');
    const imgPropsSummaryTop5 = pdf.getImageProperties(imgDataSummaryTop5);
    const imgWidthSummaryTop5 = pdfWidth - 10;
    const imgHeightSummaryTop5 = (imgPropsSummaryTop5.height * imgWidthSummaryTop5) / imgPropsSummaryTop5.width;
    pdf.addImage(imgDataSummaryTop5, 'PNG', 5, 5, imgWidthSummaryTop5, imgHeightSummaryTop5);

    // หน้า 2: กราฟ CTR + Bar รวมหน้าเดียว
    const chartsEl = document.querySelector('#charts') as HTMLElement | null;
    if (!chartsEl) {
      alert('ไม่พบส่วนกราฟ');
      return;
    }
    pdf.addPage();
    const canvasCharts = await html2canvas(chartsEl, { scale: 2 });
    const imgDataCharts = canvasCharts.toDataURL('image/png');
    const imgPropsCharts = pdf.getImageProperties(imgDataCharts);
    const imgWidthCharts = pdfWidth - 10;
    const imgHeightCharts = (imgPropsCharts.height * imgWidthCharts) / imgPropsCharts.width;
    pdf.addImage(imgDataCharts, 'PNG', 5, 5, imgWidthCharts, imgHeightCharts);

    // หน้า 3: ตารางข้อมูลทั้งหมด (ไม่แบ่งหน้า)
    pdf.addPage();

    const head = [[
      'No.',
      'KOL Name',
      'Followers',
      'Platform',
      'Reach',
      'Likes',
      'Comments',
      'Shares',
      'Total Engagement',
      'CTR (%)',
    ]];

    const body = kols.value.map(kol => [
      kol.no,
      kol.kolName,
      kol.follower.toLocaleString(),
      kol.platform,
      kol.reach.toLocaleString(),
      kol.like.toLocaleString(),
      kol.comment.toLocaleString(),
      kol.share.toLocaleString(),
      kol.totalEngagement.toLocaleString(),
      kol.ctr.toFixed(2),
    ]);

    autoTable(pdf, {
      head,
      body,
      startY: 10,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [100, 100, 255] },
      margin: { left: 5, right: 5 },
      pageBreak: 'auto',
    });

    pdf.save('Full_KOL_Report.pdf');
  } catch (error) {
    console.error('Export PDF failed:', error);
  }
};
</script>

<template>
  <div class="page-container">
    <h1>UNBOX Details</h1>

    <div class="export-button-wrapper">
      <button @click="exportFullPagePDF" class="btn-export">Export Full Report PDF</button>
    </div>

    <div v-if="loading" class="loading">Loading Data...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="!loading && !error">
      <!-- หน้า 1: summary + top 5 -->
      <div id="summary-and-top5">
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

        <div class="ranking-card" style="margin-top: 20px;">
          <h2>Top 5 KOLs by Engagement</h2>
          <table class="top5-table">
            <thead>
              <tr>
                <th>KOL Name</th>
                <th>Follower</th>
                <th>Link Post</th>
                <th>Total Engagement</th>
                <th>CTR%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in topKOLsByEngagement" :key="item.no">
                <td>{{ item.kolName }}</td>
                <td>{{ item.follower.toLocaleString() }}</td>
                <td>
                  <a :href="item.link" target="_blank" rel="noopener noreferrer">{{ item.link }}</a>
                </td>
                <td>{{ item.totalEngagement.toLocaleString() }}</td>
                <td>{{ item.ctr.toFixed(2) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- หน้า 2: กราฟ CTR + Bar รวมใน div เดียว -->
      <div id="charts" style="margin-top: 30px;">
        <div class="chart-container">
          <h2>CTR (%) by KOL Type</h2>
          <LineChart :chart-data="lineChartDataKolCTR" />
        </div>

        <div class="chart-container" style="margin-top: 20px;">
          <h2>Kols Engagement</h2>
          <BarChart :chart-data="barChartDataKolEngagement" />
        </div>
      </div>

      <!-- หน้า 3: ตารางข้อมูลทั้งหมด -->
      <div class="table-container" style="margin-top: 30px;">
        <h2>KOLs Data</h2>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>KOL Name</th>
              <th>Followers</th>
              <th>Platform</th>
              <th>Reach</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Shares</th>
              <th>Total Engagement</th>
              <th>CTR (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="kol in kols" :key="kol.no">
              <td>{{ kol.no }}</td>
              <td>{{ kol.kolName }}</td>
              <td>{{ kol.follower.toLocaleString() }}</td>
              <td>{{ kol.platform }}</td>
              <td>{{ kol.reach.toLocaleString() }}</td>
              <td>{{ kol.like.toLocaleString() }}</td>
              <td>{{ kol.comment.toLocaleString() }}</td>
              <td>{{ kol.share.toLocaleString() }}</td>
              <td>{{ kol.totalEngagement.toLocaleString() }}</td>
              <td>{{ kol.ctr.toFixed(2) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.top5-table a {
  text-decoration: none;
  color: var(--text-dark);
  font-weight: 600;
  transition: color 0.2s ease;
}

.top5-table a:hover {
  text-decoration: underline;
  color: var(--pastel-green);
}

/* ปรับตารางให้สวย */
table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  background-color: palevioletred;
  color: white;
  padding: 8px;
  text-align: left;
}

tbody td {
  border-bottom: 1px solid #ddd;
  padding: 8px;
}

tbody tr:hover {
  background-color: #f1f1f1;
}

.summary-cards-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.summary-card {
  flex: 1;
  min-width: 120px;
  background: #f9f9f9;
  border-top: 6px solid;
  padding: 12px;
  border-radius: 6px;
  box-shadow: var(--shadow);
}

.summary-value {
  font-size: 1.4em;
  font-weight: 700;
}

.chart-container {
  background: #fff;
  padding: 12px;
  border-radius: 6px;
  box-shadow: var(--shadow);
}

/* ปุ่ม pagination เอาออก เพราะไม่ใช้ */
</style>
