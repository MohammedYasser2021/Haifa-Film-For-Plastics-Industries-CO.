export const SUPPLIER = "Haifa Film for Plastic Industries Co";
export const COLORS = ["Clear White", "Milky White", "B & W", "Blue"];
export const LOGOS = ["No Logo", "Logo"];
export const VISCOSITIES = ["Low", "M", "H", "SH", "SSH"];
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
