export const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
export const formatPct = (n: number, digits = 2) =>
  Number.isFinite(n) ? Number(n.toFixed(digits)) : 0;
