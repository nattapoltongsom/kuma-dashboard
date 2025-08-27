"use client";
import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type Props = {
  title: string;
  value: number | string;
  delta?: number;
  caption?: string;
  icon?: ReactNode;
  align?: "start" | "center" | "end";
};

export default function StatCard({
  title,
  value,
  delta,
  caption,
  icon,
  align = "start",
}: Props) {
  const displayValue =
    typeof value === "number" ? value.toLocaleString() : value;

  const deltaType =
    typeof delta === "number"
      ? delta > 0
        ? "up"
        : delta < 0
          ? "down"
          : "flat"
      : null;

  const deltaText =
    typeof delta === "number"
      ? `${delta > 0 ? "+" : ""}${delta.toFixed(2)}%`
      : null;

  const deltaStyle =
    deltaType === "up"
      ? "text-emerald-600 bg-emerald-50 ring-emerald-200"
      : deltaType === "down"
        ? "text-rose-600 bg-rose-50 ring-rose-200"
        : "text-gray-600 bg-gray-50 ring-gray-200";

  const DeltaIcon =
    deltaType === "up"
      ? TrendingUp
      : deltaType === "down"
        ? TrendingDown
        : Minus;

  const alignItemsCls =
    align === "center"
      ? "items-center"
      : align === "end"
        ? "items-end"
        : "items-start";
  const textAlignCls =
    align === "center"
      ? "text-center"
      : align === "end"
        ? "text-right"
        : "text-left";
  const selfAlignCls =
    align === "center"
      ? "self-center"
      : align === "end"
        ? "self-end"
        : "self-start";

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400" />

      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="text-sm font-medium text-gray-500">{title}</div>
          {icon && (
            <div className="rounded-xl bg-gray-50 p-2 text-gray-700 ring-1 ring-gray-200">
              {icon}
            </div>
          )}
        </div>

        {align === "start" ? (
          <div className="flex items-end justify-between gap-3">
            <div className="tracking-tight">
              <div className="text-3xl font-semibold leading-none md:text-4xl">
                {displayValue}
              </div>
              {caption && (
                <div className="mt-1 text-xs text-gray-500">{caption}</div>
              )}
            </div>

            {deltaText && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${deltaStyle}`}
                title="Change vs previous period"
              >
                <DeltaIcon className="h-4 w-4" />
                {deltaText}
              </span>
            )}
          </div>
        ) : (
          <div
            className={`flex flex-col ${alignItemsCls} ${textAlignCls} gap-2`}
          >
            <div className="tracking-tight">
              <div className="text-3xl font-semibold leading-none md:text-4xl">
                {displayValue}
              </div>
              {caption && (
                <div className="mt-1 text-xs text-gray-500">{caption}</div>
              )}
            </div>

            {deltaText && (
              <span
                className={`inline-flex ${selfAlignCls} items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${deltaStyle}`}
                title="Change vs previous period"
              >
                <DeltaIcon className="h-4 w-4" />
                {deltaText}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
