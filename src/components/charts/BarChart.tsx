"use client";

import { useId } from "react";
import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

type Props = {
  data: any[];
  xKey: string;
  yKey: string;
  label: string;
  h?: number;
  colorFrom?: string;
  colorTo?: string;
  barRadius?: number;

  /** แสดงตัวเลขบนแท่ง */
  showDataLabels?: boolean;
  /** ฟอร์แมตค่าบนแท่ง */
  dataLabelFormatter?: (v: number) => string;
};

const num = (v: any) =>
  typeof v === "number" ? v.toLocaleString() : (v ?? "-");
const TickStyle = { fontSize: 12, fill: "#6b7280" };

function TooltipCard({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div
      className="rounded-xl bg-white ring-1 ring-gray-200 shadow px-3 py-2 text-sm"
      style={{ pointerEvents: "none" }}
    >
      <div className="font-medium text-gray-700 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: p.color }}
        />
        <span className="text-gray-600">{p.name}:</span>
        <span className="font-semibold text-gray-900">{num(p.value)}</span>
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

export default function BarChart({
  data,
  xKey,
  yKey,
  label,
  h = 460,
  colorFrom = "#60a5fa",
  colorTo = "#3b82f6",
  barRadius = 6,
  showDataLabels = true,
  dataLabelFormatter,
}: Props) {
  const gradId = useId();
  const fmt = (v: any) =>
    typeof v === "number"
      ? dataLabelFormatter
        ? dataLabelFormatter(v)
        : v.toLocaleString()
      : String(v ?? "");

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400" />
      <div className="p-4">
        <div className="font-semibold mb-2 text-gray-900">{label}</div>
        <div style={{ height: h }}>
          <ResponsiveContainer width="100%" height="100%">
            <RBarChart
              data={data}
              margin={{ top: 8, right: 16, bottom: 24, left: 12 }}
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colorFrom} />
                  <stop offset="100%" stopColor={colorTo} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey={xKey}
                tick={TickStyle as any}
                angle={-20}
                textAnchor="end"
                height={60}
                interval={0}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={TickStyle as any}
                width={60}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <Tooltip content={<TooltipCard />} />
              <Legend
                verticalAlign="bottom"
                align="right"
                content={<LegendPills />}
              />
              <Bar
                dataKey={yKey}
                name={yKey}
                fill={`url(#${gradId})`}
                radius={[barRadius, barRadius, 0, 0]}
              >
                {showDataLabels && (
                  <LabelList
                    dataKey={yKey}
                    position="top"
                    offset={6}
                    fill="#374151"
                    fontSize={11}
                    formatter={(v: any) => fmt(v)}
                  />
                )}
              </Bar>
            </RBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
