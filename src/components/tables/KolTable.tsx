"use client";
import { useMemo, useState } from "react";
import { KolComputed } from "@/lib/types";
import { Search, ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { shortLinkLabel } from "@/lib/stringHelper";

type SortKey =
  | "id"
  | "name"
  | "followers"
  | "platform"
  | "view"
  | "likes"
  | "comments"
  | "shares"
  | "save"
  | "totalEngagement"
  | "er"
  | "erv";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const platformBadge = (p: string) => {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1";
  switch (p) {
    case "Instagram":
      return `${base} bg-[#fff1f2] text-[#be123c] ring-[#fecdd3]`;
    case "TikTok":
      return `${base} bg-[#ecfeff] text-[#155e75] ring-[#bae6fd]`;
    case "Facebook":
      return `${base} bg-[#eff6ff] text-[#1d4ed8] ring-[#bfdbfe]`;
    case "YouTube":
      return `${base} bg-[#fef2f2] text-[#b91c1c] ring-[#fecaca]`;
    case "X":
      return `${base} bg-[#f3f4f6] text-[#111827] ring-[#e5e7eb]`;
    default:
      return `${base} bg-[#f9fafb] text-[#374151] ring-[#e5e7eb]`;
  }
};

export default function KolTable({ rows }: { rows: KolComputed[] }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        String(r.platform).toLowerCase().includes(q) ||
        String(r.followers).includes(q),
    );
  }, [rows, query]);

  const sorted = useMemo(() => {
    const data = [...filtered];
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
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = useMemo(
    () => sorted.slice((page - 1) * pageSize, page * pageSize),
    [sorted, page, pageSize],
  );

  const onSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? (
        <ChevronUp className="h-4 w-4 inline-block" />
      ) : (
        <ChevronDown className="h-4 w-4 inline-block" />
      )
    ) : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400" />

      <div className="p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-semibold text-gray-900">KOLs Data</div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm">
              <span>Rows</span>
              <select
                className="border rounded px-2 py-1"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <label className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                className="w-64 rounded border pl-7 pr-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Search name / platform / followers…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
            </label>
          </div>
        </div>

        <div className="relative overflow-auto rounded-xl ring-1 ring-gray-200">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr className="text-left">
                {[
                  { k: "id", label: "No." },
                  { k: "name", label: "KOL Name" },
                  { k: "followers", label: "Followers" },
                  { k: "platform", label: "Platform" },
                  { k: "link", label: "Link posts" },
                  { k: "view", label: "View" },
                  { k: "likes", label: "Likes" },
                  { k: "comments", label: "Comments" },
                  { k: "shares", label: "Shares" },
                  { k: "save", label: "Save" },
                  { k: "totalEngagement", label: "Total Engagement" },
                  { k: "er", label: "ER (%)" },
                  { k: "erv", label: "ERV (%)" },
                ].map((col: any) => (
                  <th
                    key={col.k}
                    className="px-3 py-2 whitespace-nowrap border-b font-medium text-gray-600"
                  >
                    {"link" === col.k ? (
                      <span>{col.label}</span>
                    ) : (
                      <button
                        className="inline-flex items-center gap-1 hover:underline"
                        onClick={() => onSort(col.k as SortKey)}
                      >
                        {col.label} <SortIcon col={col.k as SortKey} />
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-b">{r.id}</td>
                  <td className="px-3 py-2 border-b whitespace-nowrap font-medium text-gray-900">
                    {r.name}
                  </td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {r.followers.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border-b">
                    <span className={platformBadge(String(r.platform))}>
                      {r.platform}
                    </span>
                  </td>

                  <td className="px-3 py-2 border-b max-w-[260px]">
                    <a
                      href={r.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={r.link}
                      className="inline-flex max-w-full items-center gap-1 text-sky-700 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      <span className="max-w-[220px] truncate">
                        {shortLinkLabel(r.link, 42)}
                      </span>
                    </a>
                  </td>

                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {r.view.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {r.likes.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {r.comments.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {r.shares.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {r.save.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {r.totalEngagement.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {r.er.toFixed(2)}%
                  </td>
                  <td className="px-3 py-2 border-b text-right tabular-nums">
                    {r.erv.toFixed(2)}%
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={13}
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm">
          <div className="text-gray-600">
            Showing{" "}
            <span className="font-medium text-gray-900">
              {sorted.length === 0 ? 0 : (page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, sorted.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-900">{sorted.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
