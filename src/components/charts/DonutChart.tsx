"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Label,
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
        <span className="font-medium text-gray-900">
          {percent.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function LegendPills({ payload }: any) {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 text-xs justify-end">
      {payload.map((it: any, i: number) => {
        const pct =
          typeof it?.payload?.__percent === "number"
            ? it.payload.__percent
            : 0;
        return (
          <span
            key={`${it.value}-${i}`}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 ring-1 ring-gray-200 bg-white text-gray-700"
            title={`${it.value} — ${pct.toFixed(1)}%`}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: it.color }}
            />
            {it.value}
            <span className="text-gray-500">({pct.toFixed(1)}%)</span>
          </span>
        );
      })}
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
    const total = Math.max(0, data.reduce((s, d) => s + (d.value || 0), 0));
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
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Legend
                  verticalAlign="top"
                  align="right"
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

                  <Label
                    content={(props) => {
                      const { cx, cy } = (props.viewBox || {}) as {
                        cx: number;
                        cy: number;
                      };
                      if (typeof cx !== "number" || typeof cy !== "number")
                        return null;
                      return (
                        <g pointerEvents="none">
                          <text
                            x={cx}
                            y={cy - 8}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#6b7280"
                            fontSize={12}
                          >
                            Total
                          </text>
                          <text
                            x={cx}
                            y={cy + 10}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#111827"
                            fontSize={18}
                            fontWeight={600}
                          >
                            {total.toLocaleString()}
                          </text>
                        </g>
                      );
                    }}
                  />
                </Pie>
              </RPieChart>
            </ResponsiveContainer>
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
