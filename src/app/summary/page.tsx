import LineChart from "@/components/charts/LineChart";
import StatCard from "@/components/cards/StatCard";
import CampaignsSummaryTable from "@/components/tables/CampaignsSummaryTable";
import { getSummaryRows } from "@/lib/dataSource";
import { sum } from "@/lib/math";
import HeroMetricCard from "@/components/cards/HeroMetricCard";
import CostPairCard from "@/components/cards/CostPairCard";
import ExportSummaryPdfButton from "@/components/export/ExportSummaryPdfButton";
import MultiBarChart from "@/components/charts/MultiBarChart";
import DonutChart from "@/components/charts/DonutChart";
import EngagementRankingCard from "@/components/lists/EngagementRankingCard";

export const revalidate = 0;

export default async function SummaryPage() {
  const rows = await getSummaryRows();

  const totalView = sum(rows.map((r) => r.totalView));
  const totalLikes = sum(rows.map((r) => r.totalLikes));
  const totalComments = sum(rows.map((r) => r.totalComments));
  const totalShares = sum(rows.map((r) => r.totalShares));
  const totalSave = sum(rows.map((r) => r.totalSave));
  const totalEngagement = sum(rows.map((r) => r.totalEngagement));

  const chartTotalByCampaignData = rows.map((r) => ({
    name: r.name,
    Engagement: r.totalEngagement,
    Views: r.totalView,
    Comments: r.totalComments,
    Likes: r.totalLikes,
    Shares: r.totalShares,
    Save: r.totalSave,
  }));

  const chartErByCampaignData = rows.map((r) => ({
    name: r.name,
    avgEr: r.avgER,
  }));
  const chartErvByCampaignData = rows.map((r) => ({
    name: r.name,
    avgErv: r.avgERV,
  }));
  const chartEngagementRatioData = rows.map((r) => ({
    name: r.name,
    value: r.totalEngagement,
  }));
  const rankingCampaignByEngagements = rows.map((r) => ({
    no: r.id,
    campaignName: r.name,
    totalEngagement: r.totalEngagement,
  }));

  const totalCost = rows[0].cost || 0;
  const lastUpdated = rows[0].lastUpdated || "";
  const costPerEngagement = totalEngagement ? totalCost / totalEngagement : 0;
  const costPerView = totalView ? totalCost / totalView : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-baseline gap-2">
          <span className="font-bold">Summary</span>
          <span className="text-sm text-gray-400 font-normal">
            ( last updated : {lastUpdated})
          </span>
        </h1>

        <ExportSummaryPdfButton
          title="Summary"
          fileName="Summary Campaigns Kuma (Report).pdf"
          totals={{
            totalView,
            totalLikes,
            totalComments,
            totalShares,
            totalSave,
            totalEngagement,
            costPerEngagement,
            costPerView,
          }}
          rows={rows}
          page1Id="summary-p1"
          page2Id="summary-p2"
          page3Id="summary-p3"
          page4Id="summary-p4"
          page5Id="summary-p5"
        />
      </div>

      <section data-export-id="summary-p1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <HeroMetricCard
            title="Total Engagement"
            value={totalEngagement}
            align="center"
          />
          <HeroMetricCard title="Total View" value={totalView} align="center" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <HeroMetricCard
            title="Cost per Engagement"
            value={costPerEngagement.toFixed(2) || 0}
            align="center"
            prefix="฿"
          />
          <HeroMetricCard
            title="Cost per View"
            value={costPerView.toFixed(2) || 0}
            align="center"
            prefix="฿"
          />
        </div>
      </section>

      <section data-export-id="summary-p2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid grid-cols-1">
            <DonutChart
              label="Engagement rate by Campaign"
              data={chartEngagementRatioData}
              h={420}
              innerRadiusPct={62}
            />
          </div>
          <div className="grid grid-cols-1">
            <div className="grid grid-cols-1">
              <EngagementRankingCard
                items={rankingCampaignByEngagements}
                top={5}
              />
            </div>
          </div>
        </div>
      </section>

      <section data-export-id="summary-p3">
        <div className="grid grid-cols-1">
          <MultiBarChart
            label="Total by Campaign"
            data={chartTotalByCampaignData}
            categoryKey="name"
            series={[
              { key: "Engagement", name: "Engagement", color: "#22c55e" },
              { key: "Views", name: "View", color: "#3b82f6" },
              { key: "Comments", name: "Comment", color: "#f59e0b" },
              { key: "Likes", name: "Like", color: "#ef4444" },
              { key: "Shares", name: "Share", color: "#8b5cf6" },
              { key: "Save", name: "Save", color: "#06b6d4" },
            ]}
          />
        </div>
      </section>

      <section data-export-id="summary-p4">
        <div className="grid grid-cols-1">
          <LineChart
            data={chartErByCampaignData}
            xKey="name"
            yKey="avgEr"
            label="ER (%) by Campaign"
            color="#b8e0d2"
            h={380}
            yFormat="percent"
            yDecimals={2}
            tooltipDecimals={2}
          />
        </div>
      </section>

      <section data-export-id="summary-p5">
        <div className="grid grid-cols-1">
          <LineChart
            data={chartErvByCampaignData}
            xKey="name"
            yKey="avgErv"
            label="ERV (%) by Campaign"
            color="#FF6384"
            h={380}
            yFormat="percent"
            yDecimals={2}
            tooltipDecimals={2}
          />
        </div>
      </section>

      <CampaignsSummaryTable rows={rows} />
    </div>
  );
}
