import Link from "next/link";

type Item = {
  no: number | string;
  campaignName: string;
  totalEngagement: number;
};

export default function EngagementRankingCard({
  items,
  title = "Total Engagement by Campaign",
  top = 10,
}: {
  items: Item[];
  title?: string;
  top?: number;
}) {
  const data = [...items]
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, top);

  const nf = new Intl.NumberFormat("en-US");

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400" />
      <div className="p-4">
        <h2 className="mb-3 font-semibold text-gray-900">{title}</h2>

        <div className="divide-y divide-gray-200 rounded-xl ring-1 ring-gray-200">
          {data.map((it, idx) => (
            <Link
              key={String(it.no)}
              href={`/campaign/${it.no}`}
              className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={[
                    "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                    idx === 0
                      ? "bg-amber-100 text-amber-800"
                      : idx === 1
                        ? "bg-slate-100 text-slate-800"
                        : idx === 2
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-700",
                  ].join(" ")}
                >
                  {idx + 1}
                </span>
                <span className="truncate">{it.campaignName}</span>
              </div>

              <span className="tabular-nums font-semibold text-gray-900">
                {nf.format(it.totalEngagement)}
              </span>
            </Link>
          ))}

          {data.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-gray-500">
              No data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
