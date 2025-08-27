"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import BlockingLoader from "../ui/BlockingLoader";
import { writeCenteredTitle } from "@/lib/stringHelper";

type Totals = {
  totalView: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSave: number;
  totalEngagement: number;
  costPerEngagement?: number;
  costPerView?: number;
};

type SummaryRow = {
  id: number;
  name: string;
  totalKols: number;
  platform: string;
  totalView: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSave: number;
  totalEngagement: number;
  avgER: number;
  avgERV: number;
};

const fmt = (n: number | string) =>
  typeof n === "number" ? n.toLocaleString() : String(n ?? "");

function addFittedImage(
  doc: jsPDF,
  dataUrl: string,
  imgWpx: number,
  imgHpx: number,
  margin = 10,
) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;

  const ratio = imgWpx / imgHpx;
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) {
    h = maxH;
    w = h * ratio;
  }
  const x = (pageW - w) / 2;
  const y = (pageH - h) / 2;
  doc.addImage(dataUrl, "PNG", x, y, w, h);
}

async function captureByExportId(exportId: string, targetW = 1600) {
  const el = document.querySelector<HTMLElement>(
    `[data-export-id="${exportId}"]`,
  );
  if (!el) throw new Error(`Element not found: ${exportId}`);

  const rect = el.getBoundingClientRect();
  const w0 = rect.width || el.offsetWidth || 800;
  const h0 = rect.height || el.offsetHeight || 400;

  const w = targetW;
  const h = Math.round((h0 / w0) * w);
  const scale = w / w0;

  const dataUrl = await toPng(el, {
    cacheBust: true,
    pixelRatio: 2,
    width: w,
    height: h,
    style: {
      transform: `scale(${scale})`,
      transformOrigin: "top left",
      width: `${w0}px`,
      height: `${h0}px`,
      backgroundColor: "#ffffff",
    },
  });

  const dim = await new Promise<{ w: number; h: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.width, h: img.height });
    img.onerror = reject;
    img.src = dataUrl;
  });

  return { dataUrl, ...dim };
}

async function loadLogo(logoSrc: string) {
  const res = await fetch(logoSrc);
  if (!res.ok) throw new Error(`Logo not found: ${logoSrc}`);
  const blob = await res.blob();
  const mime = blob.type || "image/png";
  const format = mime.includes("jpeg") || mime.includes("jpg") ? "JPEG" : "PNG";

  const dataUrl: string = await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });

  const dim = await new Promise<{ w: number; h: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = reject;
    img.src = dataUrl;
  });

  return { dataUrl, format: format as "PNG" | "JPEG", ...dim };
}

function drawLogoTopRight(
  doc: jsPDF,
  logo: { dataUrl: string; format: "PNG" | "JPEG"; w: number; h: number },
  options?: { widthMm?: number; marginMm?: number },
) {
  const pageW = doc.internal.pageSize.getWidth();
  const { widthMm = 16, marginMm = 6 } = options || {};
  const aspect = logo.h > 0 ? logo.h / logo.w : 1;
  const w = widthMm;
  const h = w * aspect;
  const x = pageW - marginMm - w;
  const y = marginMm;
  doc.addImage(logo.dataUrl, logo.format, x, y, w, h);
}

export default function ExportSummaryPdfButton({
  title = "Summary",
  fileName = "summary.pdf",
  totals,
  rows,
  page1Id = "summary-p1",
  page2Id = "summary-p2",
  page3Id = "summary-p3",
  page4Id = "summary-p4",
  page5Id = "summary-p5",
  logoSrc = "/logo.png",
  logoWidthMm = 16,
}: {
  title?: string;
  fileName?: string;
  totals: Totals;
  rows: SummaryRow[];
  page1Id?: string;
  page2Id?: string;
  page3Id?: string;
  page4Id?: string;
  page5Id?: string;
  logoSrc?: string;
  logoWidthMm?: number;
}) {
  const [loading, setLoading] = React.useState(false);

  const TITLE_Y = 40; 

  const flushPaint = React.useCallback(async () => {
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
  }, []);

  const handleExport = async () => {
    setLoading(true);
    await flushPaint();

    try {
      const logo = await loadLogo(logoSrc);

      const [p1, p2, p3, p4, p5] = await Promise.all([
        captureByExportId(page1Id, 1600),
        captureByExportId(page2Id, 1600),
        captureByExportId(page3Id, 1600),
        captureByExportId(page4Id, 1600),
        captureByExportId(page5Id, 1600),
      ]);

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      writeCenteredTitle(doc, `${title} — Overview`, TITLE_Y);
      addFittedImage(doc, p1.dataUrl, p1.w, p1.h, 10);
      drawLogoTopRight(doc, logo, { widthMm: logoWidthMm * 2, marginMm: 6 });

      doc.addPage("a4", "landscape");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      writeCenteredTitle(doc, "Engagement Share & Ranking", TITLE_Y);
      addFittedImage(doc, p2.dataUrl, p2.w, p2.h, 10);
      drawLogoTopRight(doc, logo, { widthMm: logoWidthMm * 2, marginMm: 6 });

      doc.addPage("a4", "landscape");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      writeCenteredTitle(doc, "Total by Campaign", TITLE_Y);
      addFittedImage(doc, p3.dataUrl, p3.w, p3.h, 10);
      drawLogoTopRight(doc, logo, { widthMm: logoWidthMm * 2, marginMm: 6 });

      doc.addPage("a4", "landscape");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      writeCenteredTitle(doc, "ER (%) by Campaign", TITLE_Y);
      addFittedImage(doc, p4.dataUrl, p4.w, p4.h, 10);
      drawLogoTopRight(doc, logo, { widthMm: logoWidthMm * 2, marginMm: 6 });

      doc.addPage("a4", "landscape");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      writeCenteredTitle(doc, "ERV (%) by Campaign", TITLE_Y);
      addFittedImage(doc, p5.dataUrl, p5.w, p5.h, 10);
      drawLogoTopRight(doc, logo, { widthMm: logoWidthMm * 2, marginMm: 6 });

      const sum = (arr: SummaryRow[], k: keyof SummaryRow) =>
        arr.reduce((a, b) => a + (Number(b[k]) || 0), 0);

      const totalView = sum(rows, "totalView");
      const totalLikes = sum(rows, "totalLikes");
      const totalComments = sum(rows, "totalComments");
      const totalShares = sum(rows, "totalShares");
      const totalSave = sum(rows, "totalSave");
      const totalEngagement = sum(rows, "totalEngagement");
      const avgER = rows.length
        ? rows.reduce((a, b) => a + (Number(b.avgER) || 0), 0) / rows.length
        : 0;
      const avgERV = rows.length
        ? rows.reduce((a, b) => a + (Number(b.avgERV) || 0), 0) / rows.length
        : 0;

      doc.addPage("a4", "landscape");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      writeCenteredTitle(doc, "Campaigns Data", TITLE_Y);

      const body = rows.map((r) => [
        r.id,
        r.name,
        fmt(r.totalKols),
        r.platform,
        fmt(r.totalView),
        fmt(r.totalLikes),
        fmt(r.totalComments),
        fmt(r.totalShares),
        fmt(r.totalSave),
        fmt(r.totalEngagement),
        (r.avgER ?? 0).toFixed(2) + "%",
        (r.avgERV ?? 0).toFixed(2) + "%",
      ]);

      const foot = [
        [
          "",
          "TOTAL",
          "",
          "",
          fmt(totalView),
          fmt(totalLikes),
          fmt(totalComments),
          fmt(totalShares),
          fmt(totalSave),
          fmt(totalEngagement),
          avgER.toFixed(2) + "%",
          avgERV.toFixed(2) + "%",
        ],
      ];

      autoTable(doc, {
        head: [
          [
            "No.",
            "Name",
            "Total KOLs",
            "Platform",
            "View",
            "Likes",
            "Comments",
            "Shares",
            "Save",
            "Total Engagement",
            "ER %",
            "ERV %",
          ],
        ],
        body,
        foot,
        startY: 50, 
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 0.9,
          overflow: "ellipsize",
          valign: "middle",
          lineColor: [229, 231, 235],
          lineWidth: 0.2,
          textColor: [55, 65, 81],
        },
        headStyles: {
          fontSize: 7.2,
          cellPadding: 0.7,
          fillColor: [241, 245, 249],
          textColor: [30, 41, 59],
          fontStyle: "bold",
          halign: "center",
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        footStyles: {
          fontSize: 7.2,
          fillColor: [248, 250, 252],
          textColor: [17, 24, 39],
          fontStyle: "bold",
        },
        margin: { left: 6, right: 6 },
        tableWidth: "auto",
        didParseCell: (data) => {
          const { section, column, cell } = data;
          if (section === "head") cell.styles.halign = "center";
          if (section === "body") {
            const numericCols = [0, 2, 4, 5, 6, 7, 8, 9, 10, 11];
            if (numericCols.includes(column.index))
              cell.styles.halign = "right";
          }
          if (section === "foot") {
            const rightCols = [4, 5, 6, 7, 8, 9, 10, 11];
            if (rightCols.includes(column.index)) cell.styles.halign = "right";
            if (column.index === 1) cell.styles.halign = "left";
          }
        },
      });

      drawLogoTopRight(doc, logo, { widthMm: logoWidthMm * 2, marginMm: 6 });

      doc.save(fileName);
    } catch (e) {
      console.error("Export PDF failed:", e);
      alert("Export PDF failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleExport}
        disabled={loading}
        aria-busy={loading}
        className="hidden sm:inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
        title="Export PDF"
      >
        <Download className="h-4 w-4" />
        {loading ? "Exporting…" : "Export PDF"}
      </button>

      <BlockingLoader show={loading} text="Generating PDF…" />
    </>
  );
}
