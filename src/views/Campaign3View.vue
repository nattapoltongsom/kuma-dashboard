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
const exporting = ref(false);  // สถานะกำลัง export

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

const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;
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
};

onMounted(async () => {
  try {
    loading.value = true;
    const data = await fetchData('Campaign 3');
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

const refreshData = () => {
  loadData();
};

const exportFullPagePDF = async () => {
  try {
    exporting.value = true;
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // ---------- หน้า 1: Summary + Top 5 ----------
    const summaryAndTop5El = document.querySelector('#summary-and-top5') as HTMLElement;
    if (summaryAndTop5El) {
      const canvas = await html2canvas(summaryAndTop5El, { scale: 3 });
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth - margin * 2;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    }

    // ---------- หน้า 2: Bar Chart ----------
    const barChartEl = document.querySelector('.chart-container:nth-of-type(1)') as HTMLElement;
    if (barChartEl) {
      pdf.addPage();
      const canvas = await html2canvas(barChartEl, { scale: 3 });
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth - margin * 2;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    }

    // ---------- หน้า 3: Line Chart ----------
    const lineChartEl = document.querySelector('.chart-container:nth-of-type(2)') as HTMLElement;
    if (lineChartEl) {
      pdf.addPage();
      const canvas = await html2canvas(lineChartEl, { scale: 3 });
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth - margin * 2;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    }

    // ---------- หน้า 4: Table ----------
    pdf.addPage();
    const head = [[
      'No.', 'KOL Name', 'Followers', 'Platform',
      'Reach', 'Likes', 'Comments', 'Shares',
      'Total Engagement', 'CTR (%)'
    ]];

    const body = kols.value.map(k => [
      k.no,
      k.kolName,
      k.follower.toLocaleString(),
      k.platform,
      k.reach.toLocaleString(),
      k.like.toLocaleString(),
      k.comment.toLocaleString(),
      k.share.toLocaleString(),
      k.totalEngagement.toLocaleString(),
      k.ctr.toFixed(2),
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

    pdf.save('PETTO (KOLs Report).pdf');
  } catch (error) {
    console.error('Export PDF failed:', error);
  } finally {
    exporting.value = false;
  }
};

</script>

<template>
  <div class="page-container">
    <h1>KUMA PETTO Details</h1>

    <div class="export-button-wrapper">
      <button 
        @click="exportFullPagePDF" 
        class="btn-export" 
        :disabled="loading || exporting"
      >
        <span v-if="exporting">Exporting...</span>
        <span v-else>Export Full Report PDF</span>
      </button>
       <button 
        @click="refreshData" 
        class="btn-refresh" 
        :disabled="loading || exporting"
      >
        <span v-if="loading">Loading...</span>
        <span v-else>Refresh</span>
      </button>
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
        <div class="chart-container" style="margin-top: 20px;">
          <h2>Kols Engagement</h2>
          <BarChart :chart-data="barChartDataKolEngagement" />
        </div>
        <div class="chart-container" style="margin-top: 20px;">
          <h2>CTR (%) by KOL Type</h2>
          <LineChart :chart-data="lineChartDataKolCTR" />
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
  text-align: center;
}

tbody td {
  border-bottom: 1px solid #ddd;
  padding: 8px;
  text-align: center;
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
