import { num } from "./utils";

const AR = "٠١٢٣٤٥٦٧٨٩";
const digits = (s) => String(s || "").replace(/[٠-٩]/g, (c) => AR.indexOf(c));

// quick line entry:  "1295x1000 14"  ->  width 1.295 m, 1000 m/roll, 14 rolls
export function parseQuickLines(text) {
  const items = [], bad = [];
  digits(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean).forEach((line) => {
    const m = line.match(/^(\d+(?:[.,]\d+)?)\s*[x*×X]\s*(\d+(?:[.,]\d+)?)\s*(?:[x*×X,;:=\s-]+)\s*(\d+(?:[.,]\d+)?)\s*(?:rolls?|لفة|لفات|卷)?$/i);
    if (!m) return bad.push(line);
    const [w, l, q] = [m[1], m[2], m[3]].map((x) => parseFloat(x.replace(",", ".")));
    items.push({ width: String(w >= 10 ? +(w / 1000).toFixed(4) : w), length: String(l), qty: String(q) });
  });
  return { items, bad };
}
