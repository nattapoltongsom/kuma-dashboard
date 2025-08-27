import { fetchCsvRows } from "./googleSheets";
import type { SummaryRow, KolComputed, Platform } from "./types";

const toNum = (v: any) => {
  if (typeof v === "number") return v;
  if (v == null) return 0;
  const n = Number(String(v).replace(/,/g, "").replace(/%/g, "").trim());
  return Number.isFinite(n) ? n : 0;
};

function toPlatform(raw: any): Platform {
  const k = String(raw ?? "")
    .trim()
    .toLowerCase();

  const MAP: Record<string, Platform> = {
    instagram: "Instagram" as Platform,
    ig: "Instagram" as Platform,

    tiktok: "TikTok" as Platform,
    tt: "TikTok" as Platform,

    facebook: "Facebook" as Platform,
    fb: "Facebook" as Platform,

    youtube: "YouTube" as Platform,
    yt: "YouTube" as Platform,

    x: "X" as Platform,
    twitter: "X" as Platform,
  };

  return MAP[k] ?? ("Instagram" as Platform);
}

export async function getSummaryRows(): Promise<SummaryRow[]> {
  const rows = await fetchCsvRows("Summary");
  return rows
    .slice(0, 1) // Todo: update
    .map((r) => ({
      id: toNum(r[0]),
      name: r[1] ?? "",
      totalKols: toNum(r[2]),
      platform: toPlatform(r[3]),
      totalView: toNum(r[5]),
      totalLikes: toNum(r[6]),
      totalComments: toNum(r[7]),
      totalShares: toNum(r[8]),
      totalSave: toNum(r[9]),
      totalEngagement: toNum(r[10]),
      avgER: toNum(r[11]),
      avgERV: toNum(r[12]),
      cost: toNum(r[13]),
      lastUpdated: r[14] ?? "",
    }))
    .filter((r) => r.name);
}

export async function getCampaignRows(
  sheet:
    | "Campaign 1"
    | "Campaign 2"
    | "Campaign 3"
    | "Campaign 4"
    | "Campaign 5",
): Promise<KolComputed[]> {
  const rows = await fetchCsvRows(sheet);
  return rows
    .map((r) => ({
      id: toNum(r[0]),
      name: r[1] ?? "",
      followers: r[2] ?? "",
      platform: toPlatform(r[3]),
      link: r[4] ?? "",
      view: toNum(r[5]),
      likes: toNum(r[6]),
      comments: toNum(r[7]),
      shares: toNum(r[8]),
      save: toNum(r[9]),
      totalEngagement: toNum(r[10]),
      er: toNum(r[11]),
      erv: toNum(r[12]),
      lastUpdated: r[13] ?? "",
    }))
    .filter((r) => r.name);
}
