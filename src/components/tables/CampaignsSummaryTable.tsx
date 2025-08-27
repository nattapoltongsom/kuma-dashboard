"use client";

import { useMemo, useState } from "react";
import type { SummaryRow } from "@/lib/types";
import { ArrowUpDown, Download } from "lucide-react";

type SortKey =
  | "id"
  | "name"
  | "totalKols"
  | "platform"
  | "totalView"
  | "totalLikes"
  | "totalComments"
  | "totalShares"
  | "totalSave"
  | "totalEngagement"
  | "avgER"
  | "avgERV";

const headers: { key: SortKey | "noop"; label: string; numeric?: boolean }[] = [
  { key: "id", label: "No." },
  { key: "name", label: "Name" },
  { key: "totalKols", label: "Total Kols", numeric: true },
  { key: "platform", label: "Platform" },
  { key: "totalView", label: "View", numeric: true },
  { key: "totalLikes", label: "Likes", numeric: true },
  { key: "totalComments", label: "Comments", numeric: true },
  { key: "totalShares", label: "Shares", numeric: true },
  { key: "totalSave", label: "Save", numeric: true },
  { key: "totalEngagement", label: "Total Engagement", numeric: true },
  { key: "avgER", label: "Avg ER (%)", numeric: true },
  { key: "avgERV", label: "Avg ERV (%)", numeric: true },
];

const fmt = (n: number) => n.toLocaleString();

export default function CampaignsSummaryTable({
  rows,
  title = "Campaigns Data",
}: {
  rows: SummaryRow[];
  title?: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("totalEngagement");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const data = [...rows];
    const dir = sortDir === "asc" ? 1 : -1;
    data.sort((a, b) => {
      const A = (a as any)[sortKey];
      const B = (b as any)[sortKey];
      if (typeof A === "number" && typeof B === "number") {
        return (A - B) * dir;
      }
      return String(A).localeCompare(String(B)) * dir;
    });
    return data;
  }, [rows, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const exportCSV = () => {
    const header = headers.map((h) => h.label).join(",");
    const body = sorted
      .map((r) =>
        [
          r.id,
          csvSafe(r.name),
          r.totalKols,
          csvSafe(r.platform),
          r.totalView,
          r.totalLikes,
          r.totalComments,
          r.totalShares,
          r.totalSave,
          r.totalEngagement,
          r.avgER.toFixed(2),
          r.avgERV.toFixed(2),
        ].join(","),
      )
      .join("\n");
    const blob = new Blob([header + "\n" + body], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "campaigns_summary.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400" />

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-semibold text-gray-900">{title}</div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            title="Export CSV"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        <div className="relative overflow-auto rounded-xl ring-1 ring-gray-200">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr className="text-left">
                {headers.map((h) => (
                  <th
                    key={h.label}
                    className={[
                      "px-3 py-2 whitespace-nowrap border-b font-medium text-gray-600",
                      h.numeric ? "text-right" : "",
                    ].join(" ")}
                  >
                    {h.key === "noop" ? (
                      <span>{h.label}</span>
                    ) : (
                      <button
                        className={[
                          "inline-flex items-center gap-1 hover:underline",
                          h.numeric ? "justify-end w-full" : "",
                        ].join(" ")}
                        onClick={() => toggleSort(h.key as SortKey)}
                      >
                        {h.label}
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-b">{r.id}</td>
                  <td className="px-3 py-2 border-b whitespace-nowrap font-medium text-gray-900">
                    {r.name}
                  </td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {fmt(r.totalKols)}
                  </td>
                  <td className="px-3 py-2 border-b">{r.platform}</td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {fmt(r.totalView)}
                  </td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {fmt(r.totalLikes)}
                  </td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {fmt(r.totalComments)}
                  </td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {fmt(r.totalShares)}
                  </td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {fmt(r.totalSave)}
                  </td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {fmt(r.totalEngagement)}
                  </td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {r.avgER.toFixed(2)}%
                  </td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {r.avgERV.toFixed(2)}%
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function csvSafe(s: string) {
  if (s == null) return "";
  const needsQuote = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}
