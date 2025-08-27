"use client";

import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
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
  color?: string;
  yFormat?: "number" | "percent";
  yDecimals?: number;
  tooltipDecimals?: number;
  tooltipUnit?: string;

  /** แสดงตัวเลขบนจุดข้อมูล */
  showDataLabels?: boolean;
  /** ฟังก์ชันฟอร์แมตค่าบน label (มาก่อน yFormat) */
  dataLabelFormatter?: (v: number) => string;
};

const defaultNum = (v: any) =>
  typeof v === "number" ? v.toLocaleString() : (v ?? "-");

const TickStyle = { fontSize: 12, fill: "#6b7280" };

export default function LineChart({
  data,
  xKey,
  yKey,
  label,
  h = 460,
  color = "#3b82f6",
  yFormat = "number",
  yDecimals = 0,
  tooltipDecimals = 2,
  tooltipUnit,
  showDataLabels = true,
  dataLabelFormatter,
}: Props) {
  const fmtYTick = (v: number) => {
    if (typeof v !== "number") return defaultNum(v);
    if (yFormat === "percent") return `${v.toFixed(yDecimals)}%`;
    return v.toLocaleString();
  };

  const formatDataLabel = (v: any) => {
    if (typeof v !== "number") return defaultNum(v) as string;
    if (dataLabelFormatter) return dataLabelFormatter(v);
    if (yFormat === "percent") return `${v.toFixed(yDecimals)}%`;
    return v.toLocaleString();
  };

  const TooltipCard = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0];
    let text: string;
    if (typeof p.value === "number") {
      if (yFormat === "percent") {
        text = `${p.value.toFixed(tooltipDecimals)}%`;
      } else {
        text = p.value.toLocaleString();
      }
    } else {
      text = defaultNum(p.value) as string;
    }
    if (tooltipUnit) text = `${text}${tooltipUnit}`;

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
          <span className="font-semibold text-gray-900">{text}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400" />
      <div className="p-4">
        <div className="font-semibold mb-2 text-gray-900">{label}</div>
        <div style={{ height: h }}>
          <ResponsiveContainer width="100%" height="100%">
            <RLineChart
              data={data}
              margin={{ top: 8, right: 16, bottom: 24, left: 12 }}
            >
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
                tickFormatter={fmtYTick}
              />
              <Tooltip content={<TooltipCard />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 8 }}
              />
              <Line
                type="monotone"
                dataKey={yKey}
                name={yKey}
                stroke={color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 3 }}
              >
                {showDataLabels && (
                  <LabelList
                    dataKey={yKey}
                    content={(props: any) => {
                      const { x, y, value } = props;
                      if (x == null || y == null) return null;
                      return (
                        <text
                          x={x}
                          y={y - 8}
                          textAnchor="middle"
                          fontSize={11}
                          fill="#374151"
                        >
                          {formatDataLabel(value)}
                        </text>
                      );
                    }}
                  />
                )}
              </Line>
            </RLineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
