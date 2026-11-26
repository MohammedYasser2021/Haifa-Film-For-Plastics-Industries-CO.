export const SUPPLIER = "Haifa Film for Plastic Industries Co";
export const COLORS = ["Clear White", "Milky White", "B & W", "Blue"];
export const LOGOS = ["No Logo", "Logo"];
export const VISCOSITIES = ["Low", "M", "H", "SH", "SSH"];
export const VISCOSITY_OPTIONS = ["", ...VISCOSITIES];   // "" = nothing written on the delivery note (left empty in the monthly sheet)

// The logo field is "No Logo" | "Logo". logoBase also cleans old saved values like "Logo:Brand" (brand names were removed) back to "Logo".
export const logoBase = (v) => (String(v || "").startsWith("Logo") ? "Logo" : "No Logo");
export const CURRENCIES = ["EGP", "USD", "CNY", "EUR", "GBP", "SAR", "AED"];

export const num = (v) => parseFloat(v) || 0;
export const itemSqm = (i) => num(i.width) * num(i.length) * num(i.qty);
export const itemTotal = (i) => itemSqm(i) * num(i.price);
// OPTIONAL and rare: a delivery whose paper total is not in m2 (e.g. a weight in kg).
// measure = "m" (default) | "other";  unitName = "kg" ...;  measureTotal = the number written on the paper.
// Such a delivery adds no m2 to the lists/reports; its own number is shown instead.
export const isOther = (d) => d.measure === "other";
export const otherLabel = (d) => String(d.unitName || "").trim();
export const totals = (d) => ({
  qty: d.items.reduce((s, i) => s + num(i.qty), 0),
  sqm: isOther(d) ? 0 : d.items.reduce((s, i) => s + itemSqm(i), 0),
  other: isOther(d) ? num(d.measureTotal) : 0,
  total: d.items.reduce((s, i) => s + itemTotal(i), 0),
});
export const emptyItem = () => ({ id: crypto.randomUUID(), color: COLORS[0], logo: LOGOS[0], viscosity: "M", thickness: "", width: "", length: "", qty: "", price: "" });
export const emptyDelivery = () => ({
  id: crypto.randomUUID(), buyer: "", orderNo: "", date: new Date().toISOString().slice(0, 10),
  currency: "EGP", items: [emptyItem()], notes: "", receiver: "", measure: "m", unitName: "", measureTotal: "", product: "", sheet: null,
});

export const plain = (v) => String(+Number(v).toFixed(4));            // 12437.5
export const money = (v, dec = 2) => Number(v).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
export const cnDate = (iso) => { const [, m, d] = iso.split("-"); return `${+m}月${+d}日`; };

// groups consecutive identical rows (color/logo/viscosity/thickness) -> used for merged cells like the original sheet
export const specSpans = (items) => {
  const key = (i) => [i.color, logoBase(i.logo), i.viscosity, i.thickness].join("|");
  const spans = items.map(() => 0);
  let start = 0;
  items.forEach((it, idx) => {
    if (idx > 0 && key(it) === key(items[idx - 1])) spans[start]++;
    else { start = idx; spans[idx] = 1; }
  });
  return spans;
};

// merges consecutive identical values of ONE column (each column merges on its own, like the original Excel)
export const colSpans = (items, key) => {
  const spans = items.map(() => 0);
  let start = 0;
  items.forEach((it, idx) => {
    const v = (x) => (key === "logo" ? logoBase(x.logo) : String(x[key]));
    if (idx > 0 && v(it) === v(items[idx - 1])) spans[start]++;
    else { start = idx; spans[idx] = 1; }
  });
  return spans;
};
export const SPEC_COLS = ["color", "logo", "viscosity", "thickness"];

// Chinese names of the option values (also used by the language switch of the app)
export const ZH_OPT = { "Clear White": "透明白", "Milky White": "乳白", "B & W": "黑白", Blue: "蓝色", "No Logo": "无印刷", Logo: "有印刷", Low: "低粘", M: "中粘", H: "高粘", SH: "超高粘", SSH: "特高粘" };
export const ZH_CUR = { EGP: "埃及镑", USD: "美元", CNY: "人民币", EUR: "欧元", GBP: "英镑", SAR: "沙特里亚尔", AED: "迪拉姆" };
export const optText = (v, lang = "en") => (lang === "zh" ? ZH_OPT[v] || v : v);
export const curText = (v, lang = "en") => (lang === "zh" ? ZH_CUR[v] || v : v);
const EN_MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const dateText = (iso, lang = "en") => { const [y, m, d] = iso.split("-").map(Number); return lang === "zh" ? `${m}月${d}日` : `${d} ${EN_MON[m - 1]} ${y}`; };

// the text of one spec cell in a delivery sheet (Excel / PDF), in the chosen language
export const specText = (it, key, lang = "en") => {
  if (key === "thickness") return lang === "zh" ? `${it.thickness} 微米` : `${it.thickness} mic`;
  if (key === "logo") return optText(logoBase(it.logo), lang);
  return optText(it[key], lang);
};

export const fmt = (v) => Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 });
export const today = () => new Date().toISOString().slice(0, 10);

export const duplicateDelivery = (d) => ({
  ...d, id: crypto.randomUUID(), orderNo: "", date: today(), notes: "", receiver: "", measureTotal: "", sheet: null, updatedAt: undefined, createdAt: undefined,
  items: d.items.map((i) => ({ ...i, id: crypto.randomUUID() })),
});

export function sortList(list, { key, dir }) {
  const val = (d) => {
    if (key === "date") return d.date;
    if (key === "added") return d.createdAt || "";
    if (key === "buyer") return d.buyer.toLowerCase();
    if (key === "orderNo") return d.orderNo;
    return totals(d)[key];
  };
  const m = dir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    const x = val(a), y = val(b);
    const c = typeof x === "number" ? x - y : String(x).localeCompare(String(y));
    return c ? c * m : (b.createdAt || "").localeCompare(a.createdAt || "");
  });
}

export const COMPANY_SHORT = "Haifa Film";
export const COMPANY_SUB = "for Plastic Industries Co";

// the optional measure is kept inside the notes column (no database change): a hidden last line  [[hf:{"measure":"other","unitName":"kg","total":1445.4}]]
const META_RE = /\n?\[\[hf:(\{.*?\})\]\]\s*$/s;
export function parseNotes(raw) {
  const text = String(raw || "");
  const m = text.match(META_RE);
  if (!m) return { notes: text, meta: {} };
  let meta = {};
  try { meta = JSON.parse(m[1]) || {}; } catch { meta = {}; }
  return { notes: text.replace(META_RE, ""), meta };
}
export function composeNotes(d) {
  const text = String(d.notes || "").replace(META_RE, "");
  const meta = {};
  if (isOther(d)) {
    meta.measure = "other";
    if (otherLabel(d)) meta.unitName = otherLabel(d);
    if (String(d.measureTotal ?? "").trim() !== "") meta.total = num(d.measureTotal);
  }
  if (String(d.product || "").trim()) meta.product = String(d.product).trim();   // product name written on the note / in the warehouse sheet (e.g. "KEMET乳白膜")
  if (d.sheet) meta.sheet = d.sheet;                                           // totals written on the paper when they differ from the rows (used only by the monthly sheet)
  return Object.keys(meta).length ? `${text}\n[[hf:${JSON.stringify(meta)}]]` : text;
}
