export const SUPPLIER = "Haifa Film for Plastic Industries Co";
export const COLORS = ["Clear White", "Milky White", "B & W", "Blue"];
export const LOGOS = ["No Logo", "Logo"];
export const VISCOSITIES = ["Low", "M", "H", "SH", "SSH"];
export const VISCOSITY_OPTIONS = ["", ...VISCOSITIES];   // "" = nothing written on the delivery note (left empty in the monthly sheet)

// The logo field stays "No Logo" | "Logo". A brand name is stored after a colon: "Logo:Burj Bond" (no database change needed).
export const logoBase = (v) => (String(v || "").startsWith("Logo") ? "Logo" : "No Logo");
export const brandOf = (v) => (String(v || "").startsWith("Logo:") ? String(v).slice(5).trim() : "");
export const composeLogo = (base, brand) => (base === "Logo" ? (String(brand || "").trim() ? `Logo:${String(brand).trim()}` : "Logo") : "No Logo");
export const CURRENCIES = ["EGP", "USD", "CNY", "EUR", "GBP", "SAR", "AED"];

export const num = (v) => parseFloat(v) || 0;
export const itemSqm = (i) => num(i.width) * num(i.length) * num(i.qty);
export const itemTotal = (i) => itemSqm(i) * num(i.price);
export const totals = (d) => ({
  qty: d.items.reduce((s, i) => s + num(i.qty), 0),
  sqm: d.items.reduce((s, i) => s + itemSqm(i), 0),
  total: d.items.reduce((s, i) => s + itemTotal(i), 0),
});
export const emptyItem = () => ({ id: crypto.randomUUID(), color: COLORS[0], logo: LOGOS[0], viscosity: "M", thickness: "", width: "", length: "", qty: "", price: "" });
export const emptyDelivery = () => ({
  id: crypto.randomUUID(), buyer: "", orderNo: "", date: new Date().toISOString().slice(0, 10),
  currency: "EGP", items: [emptyItem()], notes: "", receiver: "",
});

export const plain = (v) => String(+Number(v).toFixed(4));            // 12437.5
export const money = (v, dec = 2) => Number(v).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
export const cnDate = (iso) => { const [, m, d] = iso.split("-"); return `${+m}月${+d}日`; };

// groups consecutive identical rows (color/logo/viscosity/thickness) -> used for merged cells like the original sheet
export const specSpans = (items) => {
  const key = (i) => [i.color, i.logo, i.viscosity, i.thickness].join("|");
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
    if (idx > 0 && String(it[key]) === String(items[idx - 1][key])) spans[start]++;
    else { start = idx; spans[idx] = 1; }
  });
  return spans;
};
export const SPEC_COLS = ["color", "logo", "viscosity", "thickness"];
export const specText = (it, key) => {
  if (key === "thickness") return `${it.thickness} mic`;
  if (key === "logo") return brandOf(it.logo) ? `Logo (${brandOf(it.logo)})` : logoBase(it.logo);
  return it[key];
};

export const fmt = (v) => Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 });
export const today = () => new Date().toISOString().slice(0, 10);

export const duplicateDelivery = (d) => ({
  ...d, id: crypto.randomUUID(), orderNo: "", date: today(), notes: "", receiver: "", updatedAt: undefined, createdAt: undefined,
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
