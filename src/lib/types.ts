export type Platform =
  | "Facebook"
  | "Instagram"
  | "TikTok"
  | "YouTube"
  | "X"
  | "Other";
export interface KolBase {
  id: number;
  name: string;
  followers: string;
  platform: Platform;
  link: string;
  view: number;
  likes: number;
  comments: number;
  shares: number;
  save: number;
}

export interface KolComputed extends KolBase {
  totalEngagement: number;
  er: number;
  erv: number;
  lastUpdated: string;
}

export interface CampaignPack {
  name: string;
  rows: KolBase[];
}

export interface SummaryRow {
  id: number;
  name: string;
  totalKols: number;
  platform: string;
  totalView: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSave: number;
  totalEngagement: number;
  avgER: number;
  avgERV: number;
  cost: number;
  lastUpdated: string;
}
