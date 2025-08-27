import Papa from "papaparse";

export const PUBLISHED_URL_BASE =
  process.env.NEXT_PUBLIC_SHEET_PUB_BASE ??
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQi9kca7xTx_QmHs5c4zvxgfRnRDVVKYBm-gUkXdHahpNo9IClFdyzpZnePzVSyrfC-ssU59NJiRFGu";

export const SHEET_GIDS = {
  Summary: "0",
  "Campaign 1": "998218441",
  "Campaign 2": "1372471406",
  "Campaign 3": "927765979",
  "Campaign 4": "1844093623",
  "Campaign 5": "900329987",
} as const;

export type SheetName = keyof typeof SHEET_GIDS;

export async function fetchCsvRows(sheet: SheetName): Promise<string[][]> {
  const gid = SHEET_GIDS[sheet];
  if (!gid) throw new Error(`Unknown sheet: ${sheet}`);
  const url = `${PUBLISHED_URL_BASE}/pub?gid=${gid}&single=true&output=csv`;

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok)
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  const csvText = await res.text();

  const { data, errors } = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: true,
  });
  if (errors?.length) {
    console.warn("PapaParse errors:", errors);
  }

  const rows = data as string[][];
  const headerIndex = rows.findIndex(
    (r) =>
      r?.[0]?.toLowerCase?.() === "no" || r?.[0] === "No." || r?.[0] === "No",
  );
  const start = headerIndex >= 0 ? headerIndex + 1 : 0;

  return rows.slice(start).filter((r) => (r?.filter(Boolean).length ?? 0) > 1);
}
