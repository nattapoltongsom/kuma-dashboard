"use client";

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

type Series = {
  key: string;
  name?: string;
  color?: string;
};

type Props = {
  data: any[];
  categoryKey: string;
  series: Series[];
  label?: string;
  h?: number;
  orientation?: "vertical" | "horizontal";

  /** แสดงตัวเลขบนแท่ง */
  showDataLabels?: boolean;
  /** ฟอร์แมตเลขบนแท่ง (value, seriesKey) => string */
  dataLabelFormatter?: (v: number, seriesKey: string) => string;
};

const TickStyle = { fontSize: 12, fill: "#6b7280" };
const num = (v: any) =>
  typeof v === "number" ? v.toLocaleString() : (v ?? "-");

function TooltipCard({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl bg-white ring-1 ring-gray-200 shadow px-3 py-2 text-sm"
      style={{ pointerEvents: "none" }}
    >
      <div className="font-medium text-gray-700 mb-1">{label}</div>
      <div className="space-y-1">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-gray-600">{p.name}:</span>
            <span className="font-semibold text-gray-900">{num(p.value)}</span>
          </div>
        ))}
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

export default function MultiBarChart({
  data,
  categoryKey,
  series,
  label,
  h = 460,
  orientation = "vertical",
  showDataLabels = true,
  dataLabelFormatter,
}: Props) {
  const isHorizontal = orientation === "horizontal";
  const fmt = (v: any) =>
    typeof v === "number" ? v.toLocaleString() : String(v ?? "");

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400" />
      <div className="p-4">
        {label && (
          <div className="font-semibold mb-2 text-gray-900">{label}</div>
        )}
        <div style={{ height: h }}>
          <ResponsiveContainer width="100%" height="100%">
            <RBarChart
              data={data}
              layout={isHorizontal ? "vertical" : "horizontal"}
              margin={{
                top: 8,
                right: 16,
                bottom: isHorizontal ? 8 : 24,
                left: 12,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              {isHorizontal ? (
                <>
                  <XAxis
                    type="number"
                    tick={TickStyle as any}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    type="category"
                    dataKey={categoryKey}
                    tick={TickStyle as any}
                    width={90}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    dataKey={categoryKey}
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
                </>
              )}
              <Tooltip content={<TooltipCard />} />
              <Legend
                verticalAlign="bottom"
                align="right"
                content={<LegendPills />}
              />

              {series.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.name ?? s.key}
                  fill={s.color ?? "#3b82f6"}
                  radius={[6, 6, 0, 0]}
                >
                  {showDataLabels && (
                    <LabelList
                      dataKey={s.key}
                      position={isHorizontal ? "right" : "top"}
                      offset={isHorizontal ? 6 : 6}
                      fill="#374151"
                      fontSize={11}
                      formatter={(v: any) =>
                        typeof v === "number"
                          ? dataLabelFormatter
                            ? dataLabelFormatter(v, s.key)
                            : fmt(v)
                          : fmt(v)
                      }
                    />
                  )}
                </Bar>
              ))}
            </RBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
