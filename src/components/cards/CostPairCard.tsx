import { ReactNode } from "react";

type Slot = {
  label: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  caption?: string;
  icon?: ReactNode;
};

type Props = {
  left: Slot;
  right: Slot;
  variant?: "brand" | "emerald" | "indigo";
};

const capByVariant: Record<NonNullable<Props["variant"]>, string> = {
  brand: "from-sky-400 via-indigo-400 to-emerald-400",
  emerald: "from-emerald-400 via-teal-400 to-sky-400",
  indigo: "from-indigo-400 via-sky-400 to-violet-400",
};

function Side({
  slot,
  align = "center",
}: {
  slot: Slot;
  align?: "left" | "center";
}) {
  const display =
    typeof slot.value === "number"
      ? slot.value.toLocaleString(undefined, { maximumFractionDigits: 4 })
      : String(slot.value);

  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div className="mb-2 flex items-start justify-center gap-2">
        {slot.icon && (
          <div className="rounded-xl bg-gray-50 p-2 text-gray-700 ring-1 ring-gray-200">
            {slot.icon}
          </div>
        )}
        <div className="text-sm font-medium text-gray-500">{slot.label}</div>
      </div>
      <div className="tracking-tight text-4xl md:text-5xl font-semibold text-gray-900 leading-none">
        {slot.prefix && <span className="opacity-70">{slot.prefix}</span>}
        {display}
        {slot.suffix && <span className="opacity-70">{slot.suffix}</span>}
      </div>
      {slot.caption && (
        <div className="mt-2 text-xs text-gray-500">{slot.caption}</div>
      )}
    </div>
  );
}

export default function CostPairCard({
  left,
  right,
  variant = "brand",
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${capByVariant[variant]}`}
      />
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-0 md:divide-x md:divide-gray-200">
          <div className="md:pr-6">
            <Side slot={left} />
          </div>
          <div className="md:pl-6">
            <Side slot={right} />
          </div>
        </div>
      </div>
    </section>
  );
}
