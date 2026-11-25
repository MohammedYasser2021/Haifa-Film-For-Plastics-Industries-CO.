import ExcelJS from "exceljs";
import { num, itemSqm, brandOf } from "./utils";

// Builds the monthly "销售出库" sheet from the deliveries saved in the system.
// Layout, fonts, widths, heights, merges and the 合计 row copy the Excel sheet used by the warehouse.
export const SALES_SHEET = "销售出库";
const FONT = "宋体";
const LAST_ROW = 146;                         // the original sheet keeps bordered empty rows down to row 146
const COLOR_ZH = { "Clear White": "透明膜", "Milky White": "乳白膜", "B & W": "黑白膜", Blue: "蓝膜" };
const EN_M = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
// the sheet follows the app language: "zh" = the Chinese sheet, "en" = same layout in English
export const sheetHead = (lang) => (lang === "zh" ? ["日期", "客户", "订单号", "产品名称", "发货规格", "粘度", "卷", "平方数"] : ["Date", "Customer", "Order No.", "Product", "Spec", "Viscosity", "Rolls", "SQM"]);
const sheetTitle = (lang, month) => (lang === "zh" ? `${month}月发货记录` : `${EN_M[month - 1]} Delivery Record`);
const WIDTHS = [10, 22, 25, 24, 16, 12, 11, 14, 16.42578125, 9, 9];

const round1 = (x) => Math.round((x + 1e-9) * 10) / 10;
const mm = (w) => Math.round(num(w) * 1000);                 // 1.295 m  -> 1295
const thick = (t) => +(num(t) / 10).toFixed(2);               // 35 mic   -> 3.5   (50 -> 5, 70 -> 7)
export const productName = (it, lang = "zh") => (lang === "zh" ? `${brandOf(it.logo)}${COLOR_ZH[it.color] || it.color}` : `${brandOf(it.logo)} ${it.color}`.trim());
export const customerName = (d, byId, lang = "zh") => (lang === "zh" ? byId.get(d.customerId)?.nameZh || d.buyer : byId.get(d.customerId)?.nameEn || d.buyer);

// one row per width inside a section (same color/logo/viscosity/thickness); the sqm total is merged over the whole delivery
export function buildSalesRows(list, customers, year, month, lang = "zh") {
  const byId = new Map(customers.map((c) => [c.id, c]));
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const ds = list.filter((d) => d.date.startsWith(prefix))
    .sort((a, b) => a.date.localeCompare(b.date) || (a.createdAt || "").localeCompare(b.createdAt || "") || a.orderNo.localeCompare(b.orderNo));
  const rows = [];
  let lastDate = "";
  ds.forEach((d) => {
    // one row per width inside each section (same color/logo/viscosity/thickness); ONE merged sqm total for the whole delivery
    const sections = new Map();
    d.items.forEach((it) => {
      const k = [it.color, it.logo, it.viscosity, it.thickness].join("|");
      if (!sections.has(k)) sections.set(k, { it, widths: new Map() });
      const s = sections.get(k);
      s.widths.set(mm(it.width), (s.widths.get(mm(it.width)) || 0) + num(it.qty));
    });
    const first = rows.length;
    sections.forEach((s) => {
      [...s.widths.entries()].sort((a, b) => b[0] - a[0]).forEach(([w, qty]) => {
        rows.push({
          date: null, cust: customerName(d, byId, lang), order: d.orderNo, product: productName(s.it, lang),
          spec: `${w}*${thick(s.it.thickness)}`, visc: s.it.viscosity || null, rolls: qty, sqm: null, span: 0,
        });
      });
    });
    if (d.date !== lastDate) rows[first].date = `${+d.date.slice(5, 7)}.${+d.date.slice(8, 10)}`;
    rows[first].sqm = round1(d.items.reduce((sum, it) => sum + itemSqm(it), 0));
    rows[first].span = rows.length - first;
    lastDate = d.date;
  });
  return rows;
}

const thin = { style: "thin", color: { argb: "FF000000" } };
const BORDER = { top: thin, left: thin, bottom: thin, right: thin };
const base = (cell, { bold = false, size = 12 } = {}) => {
  cell.font = { name: FONT, size, bold, color: { argb: "FF000000" } };
  cell.alignment = { horizontal: "center", vertical: "middle" };
};

export function fillSheet(ws, rows, month, lang = "zh") {
  WIDTHS.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
  ws.views = [{ zoomScale: 77, zoomScaleNormal: 77 }];

  ws.mergeCells("A1:I1");
  const title = ws.getCell("A1");
  title.value = sheetTitle(lang, month); base(title, { size: 18 }); title.numFmt = "@";
  ws.getRow(1).height = 30;

  sheetHead(lang).concat([null]).forEach((h, i) => {
    const c = ws.getCell(2, i + 1);
    c.value = h; base(c); c.border = BORDER; if (i === 0) c.numFmt = "@"; if (i === 8) c.numFmt = "#,##0.00_ ";
  });
  ws.getRow(2).height = 30;

  const style = (r) => {
    for (let c = 1; c <= 9; c++) { const cell = ws.getCell(r, c); base(cell); cell.border = BORDER; if (c === 1) cell.numFmt = "@"; }
    ws.getRow(r).height = 30;
  };
  rows.forEach((row, i) => {
    const r = 3 + i;
    style(r);
    [row.date, row.cust, row.order, row.product, row.spec, row.visc, row.rolls].forEach((v, c) => { if (v !== null && v !== undefined) ws.getCell(r, c + 1).value = v; });
    if (row.span > 0) {
      ws.getCell(r, 8).value = row.sqm;
      if (row.span > 1) ws.mergeCells(r, 8, r + row.span - 1, 8);
    }
  });

  // 合计 row
  const last = 2 + rows.length, tr = last + 1;
  style(tr);
  ws.getRow(tr).height = 21.95;
  const fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F4F8" } };
  for (let c = 1; c <= 8; c++) { const cell = ws.getCell(tr, c); base(cell, { bold: true }); cell.font = { name: FONT, size: 12, bold: true }; cell.fill = fill; }
  ws.getCell(tr, 1).value = lang === "zh" ? "合计" : "Total";
  const sumG = rows.reduce((s, x) => s + num(x.rolls), 0), sumH = rows.reduce((s, x) => s + num(x.sqm), 0);
  ws.getCell(tr, 7).value = rows.length ? { formula: `SUM(G3:G${last})`, result: sumG } : 0;
  ws.getCell(tr, 8).value = rows.length ? { formula: `SUM(H3:H${last})`, result: round1(sumH) } : 0;

  for (let r = tr + 1; r <= LAST_ROW; r++) style(r);
}

export function buildSalesWorkbook(list, customers, year, month, lang = "zh") {
  const wb = new ExcelJS.Workbook();
  fillSheet(wb.addWorksheet(lang === "zh" ? SALES_SHEET : "Sales"), buildSalesRows(list, customers, year, month, lang), month, lang);
  return wb;
}

// the sheet inside the person's own monthly workbook: wipe it and write it again, other sheets are not touched
function clearSheet(ws) {
  [...(ws.model.merges || [])].forEach((m) => ws.unMergeCells(m));
  ws.eachRow({ includeEmpty: true }, (row) => {
    row.eachCell({ includeEmpty: true }, (c) => { c.value = null; c.style = {}; });
    row.height = undefined;
  });
}
export async function fillWorkbook(wb, list, customers, year, month, lang = "zh") {
  const ws = wb.getWorksheet(SALES_SHEET);
  if (!ws) throw new Error("NO_SHEET");
  clearSheet(ws);
  fillSheet(ws, buildSalesRows(list, customers, year, month, lang), month, lang);
  return wb;
}

const save = (buf, name) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
};
export async function exportSalesSheet(list, customers, year, month, lang = "zh") {
  save(await buildSalesWorkbook(list, customers, year, month, lang).xlsx.writeBuffer(), lang === "zh" ? `${month}月销售出库.xlsx` : `${EN_M[month - 1]}-sales-sheet.xlsx`);
}
export async function exportIntoWorkbook(file, list, customers, year, month, lang = "zh") {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  await fillWorkbook(wb, list, customers, year, month, lang);
  save(await wb.xlsx.writeBuffer(), file.name);
}
