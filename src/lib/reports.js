import { totals } from "./utils";

export const currenciesIn = (list) => [...new Set(list.map((d) => d.currency))];
export const yearsIn = (list) => [...new Set(list.map((d) => d.date.slice(0, 4)))].sort();

export function agg(ds, cur) {
  let qty = 0, sqm = 0, amount = 0;
  ds.forEach((d) => { const T = totals(d); qty += T.qty; sqm += T.sqm; if (d.currency === cur) amount += T.total; });
  return { count: ds.length, qty, sqm, amount };
}

export function periodRows(list, mode, year, cur) {
  if (mode === "monthly")
    return Array.from({ length: 12 }, (_, i) => ({ key: i + 1, ...agg(list.filter((d) => d.date.startsWith(year) && +d.date.slice(5, 7) === i + 1), cur) }));
  return yearsIn(list).map((y) => ({ key: y, ...agg(list.filter((d) => d.date.startsWith(y)), cur) }));
}

export function buyerRows(list, year, cur) {
  const map = new Map();
  list.filter((d) => !year || d.date.startsWith(year)).forEach((d) => {
    const k = d.buyer.trim().toLowerCase();
    if (!map.has(k)) map.set(k, { key: k, name: d.buyer.trim(), ds: [] });
    map.get(k).ds.push(d);
  });
  return [...map.values()]
    .map((b) => ({ ...b, ...agg(b.ds, cur), last: b.ds.map((d) => d.date).sort().at(-1) }))
    .sort((a, b) => b.sqm - a.sqm);
}
