import jsPDF from "jspdf";

export function shortLinkLabel(raw: string, max = 42) {
  try {
    const u = new URL(raw);
    const host = u.host.replace(/^www\./, "");
    let path = u.pathname.replace(/\/+/g, "/");
    if (path.endsWith("/") && path !== "/") path = path.slice(0, -1);
    const label = host + (path && path !== "/" ? path : "");
    return ellipsizeMiddle(label, max);
  } catch {
    const cleaned = raw.replace(/^https?:\/\//, "").replace(/^www\./, "");
    return ellipsizeMiddle(cleaned, max);
  }
}

function ellipsizeMiddle(s: string, max = 42) {
  if (s.length <= max) return s;
  const keep = max - 1;
  const left = Math.ceil(keep / 2);
  const right = Math.floor(keep / 2);
  return s.slice(0, left) + "…" + s.slice(-right);
}

export function writeCenteredTitle(doc: jsPDF, text: string, y = 12) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(text, pageW / 2, y, { align: "center" });
}