import { itemSqm, num, COLORS, VISCOSITIES } from "./utils";

// Reads the ORGANIZED sheet (sheet "Deliveries": one row = one item, rows with the same `ref` = one delivery) and builds the same
// row objects as the PDF reader, so the review table is shared.
const r1 = (x) => Math.round((x + 1e-9) * 10) / 10;
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, "");
// numbers may come as text ("1,2") or the width in mm (1200 -> 1.2 m); the rest of the row is never changed
const toNum = (v) => { if (v == null || v === "") return v; const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", ".")); return Number.isFinite(n) ? n : v; };
const toWidthM = (v) => { const n = toNum(v); return typeof n === "number" && n >= 10 ? +(n / 1000).toFixed(4) : n; };
const cell = (v) => (v && typeof v === "object" ? (v.result ?? v.text ?? (v.richText ? v.richText.map((x) => x.text).join("") : "")) : v);

export async function readOrganizedFile(file) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const ws = wb.getWorksheet("Deliveries");
  if (!ws) throw new Error("NO_SHEET");
  const head = {};
  ws.getRow(1).eachCell((c, n) => { head[String(cell(c.value)).trim().toLowerCase()] = n; });
  for (const k of ["ref", "date", "customer", "order_no", "color", "width_m", "length_m", "qty"]) if (!head[k]) throw new Error(`NO_COLUMN ${k}`);
  const rows = [];
  ws.eachRow({ includeEmpty: false }, (row, n) => {
    if (n === 1) return;
    const g = (k) => (head[k] ? cell(row.getCell(head[k]).value) : null);
    if (g("ref") == null || g("ref") === "") return;
    rows.push({ line: n, ref: String(g("ref")), date: g("date") instanceof Date ? g("date").toISOString().slice(0, 10) : String(g("date") ?? "").trim(),
      customer: String(g("customer") ?? "").trim(), order: String(g("order_no") ?? "").trim().toUpperCase(), color: String(g("color") ?? "").trim(),
      logo: String(g("logo") ?? "").trim(), viscosity: String(g("viscosity") ?? "").trim(), thickness: g("thickness_mic"), width: toWidthM(g("width_m")), length: toNum(g("length_m")),
      qty: toNum(g("qty")), product: String(g("product") ?? "").trim(), sheetRolls: toNum(g("sheet_rolls")), price: g("price"), currency: String(g("currency") ?? "").trim().toUpperCase(), notes: String(g("notes") ?? "").trim(), total: g("sheet_total_sqm") });
  });
  return rows;
}

// records -> rows for the review table
export function buildExcelRows(records, { customers, existing, source }) {
  const groups = new Map();
  records.forEach((r) => { if (!groups.has(r.ref)) groups.set(r.ref, []); groups.get(r.ref).push(r); });
  const taken = new Set();
  const rows = [...groups.entries()].map(([ref, recs]) => {
    const issues = [];
    const add = (code, level = "warn", ...args) => issues.push({ code, level, args });
    const h = recs[0];

    let cust = customers.find((c) => norm(c.nameEn) === norm(h.customer) || (c.nameZh && norm(c.nameZh) === norm(h.customer)));
    if (!cust && h.order.startsWith("HF")) cust = [...customers].filter((c) => c.code && h.order.startsWith(`HF${c.code}`)).sort((a, b) => b.code.length - a.code.length)[0];
    const buyer = cust ? cust.nameEn : h.customer;
    if (!buyer) add("noBuyer", "error"); else if (!cust) add("newCustomer");
    if (!h.order) add("noOrder");   // a note may really have no order number (the sheet then shows it empty): warn, but still allow saving
    if (!/^\d{4}-\d{2}-\d{2}$/.test(h.date)) add("badDate", "error", h.date);

    const items = recs.map((r) => {
      const color = COLORS.find((c) => norm(c) === norm(r.color)) || "";
      if (!color) add("noColor", "error", r.line);
      const visc = VISCOSITIES.find((v) => v.toLowerCase() === r.viscosity.toLowerCase()) || "";
      return { id: crypto.randomUUID(), color: color || COLORS[0], logo: /^logo$/i.test(r.logo) ? "Logo" : "No Logo", viscosity: visc,
        thickness: r.thickness != null && r.thickness !== "" ? String(r.thickness) : "", width: String(r.width ?? ""), length: String(r.length ?? ""), qty: String(r.qty ?? ""),
        price: r.price != null && r.price !== "" ? String(r.price) : "" };
    });
    if (items.some((i) => !num(i.width) || !num(i.length) || !num(i.qty))) add("lineIncomplete", "error", items.filter((i) => !num(i.width) || !num(i.length) || !num(i.qty)).length);
    if (items.some((i) => !i.thickness)) add("noThickness");

    const sqm = items.reduce((s, i) => s + itemSqm(i), 0), rolls = items.reduce((s, i) => s + num(i.qty), 0);
    const given = num(h.total);
    if (h.total != null && h.total !== "" && Math.abs(given - sqm) > 0.05) add("totalMismatch", "warn", r1(given), r1(sqm));

    const same = existing.filter((e) => e.orderNo === h.order && e.date === h.date);
    if (same.some((e) => Math.abs(e.items.reduce((s, i) => s + itemSqm(i), 0) - sqm) < 1)) add("duplicate", "dup");
    else if (same.length) add("sameOrderDate");
    const key = `${h.order}|${h.date}|${r1(sqm)}`;
    if (h.order && taken.has(key)) add("duplicate", "dup"); else if (h.order) taken.add(key);

    // the monthly sheet must show what is written on the paper (sheet_total_sqm / sheet_rolls) even when the rows add up to a slightly different number;
    // it is only used while the rows are unchanged (calcSqm / calcRolls are the row sums at import time)
    const paperRolls = typeof h.sheetRolls === "number" ? h.sheetRolls : null;
    const sheet = {};
    if (h.total != null && h.total !== "" && r1(given) !== r1(sqm)) sheet.sqm = r1(given);
    if (paperRolls != null && paperRolls !== rolls) sheet.rolls = paperRolls;
    if (Object.keys(sheet).length) { sheet.calcSqm = r1(sqm); sheet.calcRolls = rolls; }
    const delivery = { id: crypto.randomUUID(), buyer, customerId: cust?.id || "", orderNo: h.order, date: h.date,
      currency: h.currency || "EGP", items, notes: h.notes || `Imported: ${source}`, receiver: "", measure: "m", unitName: "", measureTotal: "",
      product: h.product, sheet: Object.keys(sheet).length ? sheet : null };
    const status = issues.some((i) => i.level === "dup") ? "dup" : issues.some((i) => i.level === "error") ? "error" : issues.length ? "review" : "ok";
    return { id: delivery.id, delivery, issues, status, rolls, sqm: r1(sqm), paperSqm: h.total != null && h.total !== "" ? r1(given) : null, pages: [ref], date: h.date };
  });
  rows.sort((a, b) => a.date.localeCompare(b.date) || a.pages[0].localeCompare(b.pages[0]));
  return { rows, skipped: [], failed: [], weights: [] };
}
