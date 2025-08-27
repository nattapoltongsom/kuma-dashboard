"use client";

import { shortLinkLabel } from "@/lib/stringHelper";
import { KolComputed } from "@/lib/types";
import { ExternalLink } from "lucide-react";

const medal = (i: number) => {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  return "";
};

export default function Top5Table({ rows }: { rows: KolComputed[] }) {
  const top = [...rows]
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, 5);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400" />

      <div className="p-4">
        <div className="font-semibold mb-3 text-gray-900">
          Top 5 by Total Engagement
        </div>

        <div className="relative overflow-auto rounded-xl ring-1 ring-gray-200">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr className="text-center">
                {[
                  "Rank",
                  "KOL Name",
                  "Follower",
                  "Link post",
                  "Total Engagement",
                  "ER (%)",
                  "ERV (%)",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 whitespace-nowrap border-b font-medium text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top.map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 border-b tabular-nums">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-6 text-center">{i + 1}</span>
                      <span className="text-lg">{medal(i)}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 border-b whitespace-nowrap font-medium text-center text-gray-900">
                    {r.name}
                  </td>
                  <td className="px-3 py-2 border-b text-center tabular-nums">
                    {r.followers}
                  </td>
                  <td className="px-3 py-2 border-b text-left tabular-nums">
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
                  <td className="px-3 py-2 border-b text-center tabular-nums">
                    {r.totalEngagement.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 border-b text-center tabular-nums">
                    {r.er.toFixed(2)}%
                  </td>
                  <td className="px-3 py-2 border-b text-center tabular-nums">
                    {r.erv.toFixed(2)}%
                  </td>
                </tr>
              ))}
              {top.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
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
