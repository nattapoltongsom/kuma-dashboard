"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import BlockingLoader from "../ui/BlockingLoader";
import type { KolComputed } from "@/lib/types";
import { writeCenteredTitle } from "@/lib/stringHelper";

type Totals = {
  totalView: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSave: number;
  totalEngagement: number;
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
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
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
  const h = widthMm * aspect;
  const x = pageW - marginMm - w;
  const y = marginMm;
  doc.addImage(logo.dataUrl, logo.format, x, y, w, h);
}

export default function ExportCampaignPdfButton({
  title = "Campaign",
  fileName = "campaign.pdf",
  totals,
  rows,
  page1Id = "campaign-p1",
  page2Id = "campaign-p2",
  page3Id = "campaign-p3",
  page4Id = "campaign-p4",
  logoSrc = "/logo.png",
  logoWidthMm = 16,
}: {
  title?: string;
  fileName?: string;
  totals: Totals;
  rows: KolComputed[];
  page1Id?: string;
  page2Id?: string;
  page3Id?: string;
  page4Id?: string;
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

      const [p1, p2, p3, p4] = await Promise.all([
        captureByExportId(page1Id, 1600),
        captureByExportId(page2Id, 1600),
        captureByExportId(page3Id, 1600),
        captureByExportId(page4Id, 1600),
      ]);

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      writeCenteredTitle(doc, `${title} — Overview`, 35);
      drawLogoTopRight(doc, logo, { widthMm: logoWidthMm * 2, marginMm: 6 });
      addFittedImage(doc, p1.dataUrl, p1.w, p1.h, 10);

      doc.addPage("a4", "landscape");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      writeCenteredTitle(doc, "Total Engagement by KOL", TITLE_Y);
      drawLogoTopRight(doc, logo, { widthMm: logoWidthMm * 2, marginMm: 6 });
      addFittedImage(doc, p2.dataUrl, p2.w, p2.h, 10);

      doc.addPage("a4", "landscape");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      writeCenteredTitle(doc, "Engagement rate (ER%)", TITLE_Y);
      drawLogoTopRight(doc, logo, { widthMm: logoWidthMm * 2, marginMm: 6 });
      addFittedImage(doc, p3.dataUrl, p3.w, p3.h, 10);

      doc.addPage("a4", "landscape");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      writeCenteredTitle(doc, "Engagement rate per view (ERV%)", TITLE_Y);
      drawLogoTopRight(doc, logo, { widthMm: logoWidthMm * 2, marginMm: 6 });
      addFittedImage(doc, p4.dataUrl, p4.w, p4.h, 10);

      doc.addPage("a4", "landscape");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      writeCenteredTitle(doc, "KOLs", TITLE_Y);
      drawLogoTopRight(doc, logo, { widthMm: logoWidthMm * 2, marginMm: 6 });

      const body = rows.map((r) => [
        r.id,
        r.name,
        r.followers,
        r.platform,
        r.link,
        fmt(r.view),
        fmt(r.likes),
        fmt(r.comments),
        fmt(r.shares),
        fmt(r.save),
        fmt(r.totalEngagement),
        r.er.toFixed(2) + "%",
        r.erv.toFixed(2) + "%",
      ]);

      autoTable(doc, {
        head: [
          [
            "No.",
            "KOL Name",
            "Followers",
            "Platform",
            "Link Post",
            "View",
            "Like",
            "Comment",
            "Share",
            "Save",
            "Total Engagement",
            "ER %",
            "ERV %",
          ],
        ],
        body,
        startY: 50,
        theme: "grid",
        styles: {
          fontSize: 7.0,
          cellPadding: 0.8,
          overflow: "linebreak",
          minCellHeight: 6,
          lineColor: [229, 231, 235],
          lineWidth: 0.2,
          textColor: [31, 41, 55],
        },
        headStyles: {
          fillColor: [249, 250, 251],
          textColor: [17, 24, 39],
          fontStyle: "bold",
          halign: "center",
        },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { left: 6, right: 6, top: 12, bottom: 10 },
        tableWidth: "auto",
        columnStyles: {
          10: { cellWidth: 22, halign: "right" },
        },
        didParseCell: (data) => {
          if (data.section === "body") {
            const rightCols = [0, 2, 5, 6, 7, 8, 9, 10, 11, 12];
            if (rightCols.includes(data.column.index)) {
              data.cell.styles.halign = "right";
            }
          }
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 4) {
            const raw = (data.cell as any).raw;
            const textArr = (data.cell as any).text as string[] | undefined;
            const url =
              typeof raw === "string" ? raw : (textArr?.join(" ") ?? "");
            if (url && /^https?:\/\//i.test(url)) {
              doc.link(
                data.cell.x,
                data.cell.y,
                data.cell.width,
                data.cell.height,
                { url },
              );
            }
          }
        },
      });

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
        className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
        title="Export PDF"
      >
        <Download className="h-4 w-4" />
        {loading ? "Exporting…" : "Export PDF"}
      </button>

      <BlockingLoader show={loading} text="Generating PDF…" />
    </>
  );
}
