"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

type Slice = { name: string; value: number };

type Props = {
  data: Slice[];
  label?: string;
  h?: number;
  colors?: string[];
  innerRadiusPct?: number;
};

const DEFAULT_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#10b981",
  "#a855f7",
  "#f97316",
];

const Tick = { fontSize: 12, fill: "#6b7280" };

function TooltipCard({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const name = p?.name ?? "";
  const val =
    typeof p?.value === "number" ? p.value.toLocaleString() : (p?.value ?? "-");
  const percent = p?.payload?.__percent ?? 0;

  return (
    <div
      className="rounded-xl bg-white ring-1 ring-gray-200 shadow px-3 py-2 text-sm"
      style={{ pointerEvents: "none" }}
    >
      <div className="font-medium text-gray-700 mb-1">{name}</div>
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: p.color }}
        />
        <span className="text-gray-600">Engagement:</span>
        <span className="font-semibold text-gray-900">{val}</span>
      </div>
      <div className="text-gray-600 mt-0.5">
        Share:{" "}
        <span className="font-medium text-gray-900">{percent.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function LegendPills({ payload }: any) {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {payload.map((it: any) => (
        <span
          key={it.value}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 ring-1 ring-gray-200 bg-white text-gray-700"
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: it.color }}
          />
          {it.value}
        </span>
      ))}
    </div>
  );
}

export default function DonutChart({
  data,
  label = "Engagement share by Campaign",
  h = 420,
  colors = DEFAULT_COLORS,
  innerRadiusPct = 60,
}: Props) {
  const { total, enriched } = useMemo(() => {
    const total = Math.max(
      0,
      data.reduce((s, d) => s + (d.value || 0), 0),
    );
    const enriched = total
      ? data.map((d) => ({ ...d, __percent: (d.value / total) * 100 }))
      : data.map((d) => ({ ...d, __percent: 0 }));
    return { total, enriched };
  }, [data]);

  const hasData = total > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400" />
      <div className="p-4">
        <div className="font-semibold mb-2 text-gray-900">{label}</div>

        <div style={{ height: h }}>
          {hasData ? (
            <div className="flex h-full gap-4">
              {/* ซ้าย: กราฟโดนัท */}
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ marginTop: 8 }}
                      content={<LegendPills />}
                    />
                    <Tooltip content={<TooltipCard />} />
                    <Pie
                      data={enriched}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={`${innerRadiusPct}%`}
                      outerRadius="90%"
                      paddingAngle={1.5}
                      stroke="#ffffff"
                      strokeWidth={1}
                      isAnimationActive={false}
                    >
                      {enriched.map((entry, idx) => (
                        <Cell
                          key={`slice-${entry.name}-${idx}`}
                          fill={colors[idx % colors.length]}
                        />
                      ))}
                    </Pie>
                  </RPieChart>
                </ResponsiveContainer>
              </div>

              {/* ขวา: Summary Panel (ไม่บังกราฟตอน export) */}
              <aside className="w-56 shrink-0">
                <div className="h-full rounded-xl border bg-white p-4 ring-1 ring-gray-100">
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="text-2xl font-semibold text-gray-900 mb-3">
                    {total.toLocaleString()}
                  </div>

                  <div className="space-y-1.5 max-h-[calc(100%-3rem)] overflow-auto pr-1">
                    {enriched.map((it, i) => (
                      <div
                        key={it.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: colors[i % colors.length],
                            }}
                          />
                          <span
                            className="truncate text-gray-700"
                            title={it.name}
                          >
                            {it.name}
                          </span>
                        </div>
                        <div className="ml-2 text-gray-900 font-medium tabular-nums">
                          {(it.__percent as number).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              No data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
