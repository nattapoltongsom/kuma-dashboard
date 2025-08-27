import { ReactNode } from "react";

type Props = {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  caption?: string;
  icon?: ReactNode;
  align?: "left" | "center";
  variant?: "brand" | "emerald" | "indigo";
};

const capByVariant: Record<NonNullable<Props["variant"]>, string> = {
  brand: "from-sky-400 via-indigo-400 to-emerald-400",
  emerald: "from-emerald-400 via-teal-400 to-sky-400",
  indigo: "from-indigo-400 via-sky-400 to-violet-400",
};

export default function HeroMetricCard({
  title,
  value,
  prefix,
  suffix,
  caption,
  icon,
  align = "left",
  variant = "brand",
}: Props) {
  const display =
    typeof value === "number" ? value.toLocaleString() : String(value);

  return (
    <section className="relative overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${capByVariant[variant]}`}
      />
      <div
        className={["p-6 md:p-8", align === "center" ? "text-center" : ""].join(
          " ",
        )}
      >
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          {icon && (
            <div className="rounded-2xl bg-gray-50 p-2 text-gray-700 ring-1 ring-gray-200">
              {icon}
            </div>
          )}
        </div>
        <div
          className={[
            "tracking-tight text-5xl md:text-6xl font-semibold text-gray-900 leading-none",
            align === "center" ? "mx-auto" : "",
          ].join(" ")}
        >
          {prefix && <span className="opacity-70">{prefix}</span>}
          {display}
          {suffix && <span className="opacity-70">{suffix}</span>}
        </div>

        {caption && (
          <p
            className={[
              "mt-3 text-sm text-gray-500",
              align === "center" ? "mx-auto max-w-md" : "",
            ].join(" ")}
          >
            {caption}
          </p>
        )}
      </div>
    </section>
  );
}
