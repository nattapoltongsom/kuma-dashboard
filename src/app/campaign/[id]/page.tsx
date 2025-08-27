import BarChart from "@/components/charts/BarChart";
import LineChart from "@/components/charts/LineChart";
import StatCard from "@/components/cards/StatCard";
import KolTable from "@/components/tables/KolTable";
import Top5Table from "@/components/tables/Top5Table";
import { getCampaignRows, getSummaryRows } from "@/lib/dataSource";
import { sum } from "@/lib/math";
import { notFound } from "next/navigation";
import HeroMetricCard from "@/components/cards/HeroMetricCard";
import { Eye, Sparkles } from "lucide-react";
import type { KolComputed } from "@/lib/types";
import ExportCampaignPdfButton from "@/components/export/ExportCampaignPdfButton";

export const revalidate = 0;

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const VALID_IDS = new Set(["1", "2", "3", "4", "5"]);
  if (!VALID_IDS.has(id)) notFound();
  const summary = await getSummaryRows();
  const displayName =
    summary.find((r) => String(r.id) === id)?.name ??
    (
      {
        "1": "UNBOX",
        "2": "KATO",
        "3": "KUMA PETTO",
        "4": "Campaign 4",
        "5": "Campaign 5",
      } as Record<string, string>
    )[id] ??
    `Campaign ${id}`;

  const sheetName = `Campaign ${id}` as any;
  const rows: KolComputed[] = await getCampaignRows(sheetName);

  const totalView = sum(rows.map((r) => r.view));
  const totalLikes = sum(rows.map((r) => r.likes));
  const totalComments = sum(rows.map((r) => r.comments));
  const totalShares = sum(rows.map((r) => r.shares));
  const totalSave = sum(rows.map((r) => r.save));
  const totalEngagement = sum(rows.map((r) => r.totalEngagement));
  const chartEngagementData = rows.map((r) => ({
    name: r.name,
    Engagement: r.totalEngagement,
  }));
  const chartEngagementRateData = rows.map((r) => ({ name: r.name, er: r.er }));
  const chartEngagementRatePerViewData = rows.map((r) => ({
    name: r.name,
    erv: r.erv,
  }));
  const lastUpdated = rows[0].lastUpdated || "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-baseline gap-2">
          <span className="font-bold">Campaign {displayName}</span>
          <span className="text-sm text-gray-400 font-normal">
            ( last updated : {lastUpdated})
          </span>
        </h1>
        <ExportCampaignPdfButton
          fileName={`Kuma ${displayName} (KOLs Report).pdf`}
          title={displayName}
          totals={{
            totalView,
            totalLikes,
            totalComments,
            totalShares,
            totalSave,
            totalEngagement,
          }}
          rows={rows}
          page1Id="campaign-p1"
          page2Id="campaign-p2"
          page3Id="campaign-p3"
          page4Id="campaign-p4"
        />
      </div>

      <section data-export-id="campaign-p1" className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          <HeroMetricCard
            title="Total Engagement"
            value={totalEngagement}
            align="center"
            icon={<Sparkles className="h-5 w-5" />}
          />
          <HeroMetricCard
            title="Total View"
            value={totalView}
            icon={<Eye className="h-5 w-5" />}
            align="center"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Likes"
            value={totalLikes.toLocaleString()}
            align="center"
          />
          <StatCard
            title="Total Comments"
            value={totalComments.toLocaleString()}
            align="center"
          />
          <StatCard
            title="Total Shares"
            value={totalShares.toLocaleString()}
            align="center"
          />
          <StatCard
            title="Total Save"
            value={totalSave.toLocaleString()}
            align="center"
          />
        </div>

        <Top5Table rows={rows} />
      </section>

      <section data-export-id="campaign-p2">
        <div className="grid grid-cols-1">
          <BarChart
            data={chartEngagementData}
            xKey="name"
            yKey="Engagement"
            label="Total Engagement"
          />
        </div>
      </section>

      <section data-export-id="campaign-p3">
        <div className="grid grid-cols-1">
          <LineChart
            data={chartEngagementRateData}
            xKey="name"
            yKey="er"
            label="Engagement rate (ER%)"
            color="#FF6384"
            h={380}
            yFormat="percent"
            yDecimals={2}
            tooltipDecimals={2}
          />
        </div>
      </section>

      <section data-export-id="campaign-p4">
        <div className="grid grid-cols-1">
          <LineChart
            data={chartEngagementRatePerViewData}
            xKey="name"
            yKey="erv"
            label="Engagement rate per view (ERV%)"
            color="#FF6384"
            h={380}
            yFormat="percent"
            yDecimals={2}
            tooltipDecimals={2}
          />
        </div>
      </section>

      <KolTable rows={rows} />
    </div>
  );
}
