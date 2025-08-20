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
  follower: string;
  platform: string;
  link: string;
  view: number;
  like: number;
  comment: number;
  share: number;
  collect: number;
  erv: number;
  totalEngagement: number;
  er:number
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
    follower: row[2],
    platform: row[3],
    link: row[4],
    view: parseNumber(row[5]),
    like: parseNumber(row[6]),
    comment: parseNumber(row[7]),
    share: parseNumber(row[8]),
    collect: parseNumber(row[9]),
    totalEngagement: parseNumber(row[10]),
    erv: parseNumber(row[11]),
    er: parseNumber(row[12]),
  }));
};

const topKOLsByEngagement = computed(() =>
  [...kols.value].sort((a, b) => b.totalEngagement - a.totalEngagement).slice(0, 5)
);

const colorPalette = [
  '#b8e0d2', '#d6eaff', '#ffd6e0', '#e8d6ff', '#fff2d6', '#d6f5e8', '#b8e0d2'
];

const barChartDataKolEngagement = computed<ChartData<'bar'>>(() => ({
  labels: kols.value.map(g => g.kolName),
  datasets: [{
    label: 'Total Engagement',
    backgroundColor: colorPalette,
    data: kols.value.map(g => g.totalEngagement),
  }],
}));

const lineChartDataKolER = computed<ChartData<'line'>>(() => ({
  labels: kols.value.map(g => g.kolName),
  datasets: [{
    label: 'ER (%)',
    data: kols.value.map(g => g.er),
    borderColor: '#b8e0d2',
    backgroundColor: '#b8e0d2',
    tension: 0.1,
  }],
}));

const lineChartDataKolERV = computed<ChartData<'line'>>(() => ({
  labels: kols.value.map(g => g.kolName),
  datasets: [{
    label: 'ERV (%)',
    data: kols.value.map(g => g.erv),
    borderColor: '#ff6384',
    backgroundColor: '#ffb1c1',
    tension: 0.1,
  }],
}));

const totalSummary = computed(() => ({
  totalView: kols.value.reduce((sum, c) => sum + c.view, 0),
  totalLike: kols.value.reduce((sum, c) => sum + c.like, 0),
  totalComment: kols.value.reduce((sum, c) => sum + c.comment, 0),
  totalShare: kols.value.reduce((sum, c) => sum + c.share, 0),
  totalCollect: kols.value.reduce((sum, c) => sum + c.collect, 0),
  totalEngagement: kols.value.reduce((sum, c) => sum + c.totalEngagement, 0),
}));

const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;
    const data = await fetchData('Campaign 3');
    if (data && data.length > 0) {
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

onMounted(loadData);

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

    // ---------- หน้า 3.1: Line Chart ----------
    const lineChartEr = document.querySelector('.chart-container:nth-of-type(2)') as HTMLElement;
    if (lineChartEr) {
      pdf.addPage();
      const canvas = await html2canvas(lineChartEr, { scale: 3 });
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth - margin * 2;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    }

        // ---------- หน้า 3.2: Line Chart ----------
    const lineChartErv = document.querySelector('.chart-container:nth-of-type(3)') as HTMLElement;
    if (lineChartErv) {
      pdf.addPage();
      const canvas = await html2canvas(lineChartErv, { scale: 3 });
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
      'View', 'Likes', 'Comments', 'Shares', 'Save',
      'Total Engagement', 'ER (%)', 'ERV (%)'
    ]];

    const body = kols.value.map(k => [
      k.no,
      k.kolName,
      k.follower,
      k.platform,
      k.view.toLocaleString(),
      k.like.toLocaleString(),
      k.comment.toLocaleString(),
      k.share.toLocaleString(),
      k.collect.toLocaleString(),
      k.totalEngagement.toLocaleString(),
      k.er.toFixed(2) + '%',
      k.erv.toFixed(2) + '%'
    ]);

    autoTable(pdf, {
      head,
      body,
      styles: {
        fontSize: 7,
        halign: 'center',
        minCellHeight: 8,  
      },
      didDrawCell: (data) => {
        data.cell.height = 8; 
      }
    });

    pdf.save('Kuma petto (KOLs Report).pdf');
  } catch (error) {
    console.error('Export PDF failed:', error);
  } finally {
    exporting.value = false;
  }
};

</script>

<template>
  <div class="page-container">
    <h1>PETTO Details</h1>
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
            <h3>Total <br>Engagement</h3>
            <p class="summary-value">{{ totalSummary.totalEngagement.toLocaleString() }}</p>
          </div>
          <div class="summary-card" style="border-top-color: var(--pastel-green);">
            <h3>Total <br>View</h3>
            <p class="summary-value">{{ totalSummary.totalView.toLocaleString() }}</p>
          </div>
          <div class="summary-card" style="border-top-color: var(--pastel-blue);">
            <h3>Total <br>Likes</h3>
            <p class="summary-value">{{ totalSummary.totalLike.toLocaleString() }}</p>
          </div>
          <div class="summary-card" style="border-top-color: var(--pastel-pink);">
            <h3>Total <br>Comments</h3>
            <p class="summary-value">{{ totalSummary.totalComment.toLocaleString() }}</p>
          </div>
          <div class="summary-card" style="border-top-color: var(--pastel-yellow);">
            <h3>Total <br>Shares</h3>
            <p class="summary-value">{{ totalSummary.totalShare.toLocaleString() }}</p>
          </div>
          <div class="summary-card" style="border-top-color: var(--pastel-green);">
            <h3>Total <br>Save</h3>
            <p class="summary-value">{{ totalSummary.totalCollect.toLocaleString() }}</p>
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
                <th>ER%</th>
                <th>ERV%</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in topKOLsByEngagement" :key="item.no">
                <td>{{ item.kolName }}</td>
                <td>{{ item.follower }}</td>
                <td>
                  <a :href="item.link" target="_blank" rel="noopener noreferrer">{{ item.link }}</a>
                </td>
                <td>{{ item.totalEngagement.toLocaleString() }}</td>
                <td>{{ item.er.toFixed(2) }}%</td>
                <td>{{ item.erv.toFixed(2) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- หน้า 2: กราฟ ERV + Bar รวมใน div เดียว -->
      <div id="charts" style="margin-top: 30px;">
        <div class="chart-container" style="margin-top: 20px;">
          <h2>Total Engagement</h2>
          <BarChart :chart-data="barChartDataKolEngagement" />
        </div>
        <div class="chart-container" style="margin-top: 20px;">
          <h2>Engagement rate (ER%)</h2>
          <LineChart :chart-data="lineChartDataKolER" />
        </div>
        <div class="chart-container" style="margin-top: 20px;">
          <h2>Engagement rate per view (ERV%)</h2>
          <LineChart :chart-data="lineChartDataKolERV" />
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
              <th>View</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Shares</th>
              <th>Save</th>
              <th>Total Engagement</th>
              <th>ER (%)</th>
              <th>ERV (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="kol in kols" :key="kol.no">
              <td>{{ kol.no }}</td>
              <td>{{ kol.kolName }}</td>
              <td>{{ kol.follower }}</td>
              <td>{{ kol.platform }}</td>
              <td>{{ kol.view.toLocaleString() }}</td>
              <td>{{ kol.like.toLocaleString() }}</td>
              <td>{{ kol.comment.toLocaleString() }}</td>
              <td>{{ kol.share.toLocaleString() }}</td>
              <td>{{ kol.collect.toLocaleString() }}</td>
              <td>{{ kol.totalEngagement.toLocaleString() }}</td>
              <td>{{ kol.er.toFixed(2) }}%</td>
              <td>{{ kol.erv.toFixed(2) }}%</td>
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
  font-size: 0.7rem;

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
