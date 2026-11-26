import ExcelJS from "exceljs";
import { SUPPLIER, totals, itemSqm, itemTotal, num, colSpans, SPEC_COLS, specText, curText } from "./utils";

const FONT = "微软雅黑";
const thin = { style: "thin" };
const BORDER = { top: thin, left: thin, bottom: thin, right: thin };

// lang: the values (colour, logo, viscosity, thickness unit, currency, date format, buyer) follow the language of the app
export async function exportExcel(d, { lang = "en", buyer } = {}) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Sheet1");
  [11.9, 9.5, 9.5, 11.5, 12.54, 9.5, 11, 15, 15, 22].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  const cur = curText(d.currency, lang);
  const money = `#,##0.00" ${cur}"`;   // currency on the RIGHT of the number
  const set = (addr, value, { size = 10, bold = false, color, fill, align = "center", wrap = false, fmt } = {}) => {
    const c = ws.getCell(addr);
    c.value = value;
    c.font = { name: FONT, size, bold, color: color ? { argb: color } : undefined };
    c.alignment = { horizontal: align, vertical: "middle", wrapText: wrap };
    if (fill) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
    if (fmt) c.numFmt = fmt;
  };

  // rows 1-4
  [["Supplier (卖家)", SUPPLIER], ["Buyer (买家)", buyer || d.buyer], ["Order No. (订单号)", d.orderNo]].forEach(([l, v], i) => {
    const r = i + 1;
    ws.mergeCells(`A${r}:F${r}`); ws.mergeCells(`G${r}:J${r}`);
    set(`A${r}`, l, { size: 12, align: "right" }); set(`G${r}`, v, { size: 12 });
    ws.getRow(r).height = 25;
  });
  const [y, m, day] = d.date.split("-").map(Number);
  ws.mergeCells("A4:F4"); ws.mergeCells("G4:J4");
  set("A4", "Delivery Date（发货日期）", { size: 11, bold: true, fill: "FFFFFF00" });
  set("G4", new Date(Date.UTC(y, m - 1, day)), { size: 11, bold: true, fill: "FFFFFF00", fmt: lang === "zh" ? 'm"月"d"日"' : 'd mmm yyyy' });
  ws.getRow(4).height = 25;

  // header row 5
  ["Color\n(颜色)", "Logo\n(印刷)", "Viscosity\n(粘度)", "Thickness\n(厚度/MM)", "Width\n(宽度/M)", "M/Roll\n(米数/M)", "Quantity\n(数量/Roll)", "Total SQM\n(总平方数/M2)", "Unit Price\n/sqm\n(单价)", "Total\n(总价)"]
    .forEach((h, i) => set(ws.getRow(5).getCell(i + 1).address, h, { bold: true, wrap: true }));
  ws.getRow(5).height = 49.5;

  // data rows
  const first = 6;
  const spans = Object.fromEntries(SPEC_COLS.map((k) => [k, colSpans(d.items, k)]));
  d.items.forEach((it, idx) => {
    const r = first + idx;
    ws.getRow(r).height = 23;
    SPEC_COLS.forEach((k, ci) => {            // each column merges on its own
      const n = spans[k][idx];
      if (n > 0) {
        const col = String.fromCharCode(65 + ci);
        set(`${col}${r}`, specText(it, k, lang), { wrap: true });
        if (n > 1) ws.mergeCells(`${col}${r}:${col}${r + n - 1}`);
      }
    });
    set(`E${r}`, num(it.width)); set(`F${r}`, num(it.length)); set(`G${r}`, num(it.qty));
    set(`H${r}`, { formula: `E${r}*F${r}*G${r}`, result: itemSqm(it) });
    set(`I${r}`, num(it.price), { fmt: money });
    set(`J${r}`, { formula: `H${r}*I${r}`, result: itemTotal(it) }, { fmt: money });
  });

  // total row
  const last = first + d.items.length - 1, tr = last + 1, T = totals(d);
  const red = { bold: true, color: "FFC00000", fill: "FFBFBFBF" };
  ws.mergeCells(`C${tr}:F${tr}`);
  ["A", "B", "C", "I"].forEach((c) => set(`${c}${tr}`, c === "A" ? "Total" : null, red));
  set(`G${tr}`, { formula: `SUM(G${first}:G${last})`, result: T.qty }, red);
  set(`H${tr}`, { formula: `SUM(H${first}:H${last})`, result: T.sqm }, { ...red, fmt: "0.0_ " });
  set(`J${tr}`, { formula: `SUM(J${first}:J${last})`, result: T.total }, { ...red, fmt: `#,##0.000" ${cur}"` });
  ws.getRow(tr).height = 23;

  // notes + receiver
  ws.mergeCells(`B${tr + 1}:J${tr + 1}`); ws.mergeCells(`A${tr + 2}:J${tr + 2}`);
  set(`A${tr + 1}`, "Notes\n备注", { size: 11, wrap: true });
  set(`B${tr + 1}`, d.notes, { size: 11, align: "left", wrap: true });
  set(`A${tr + 2}`, `收货人签字\nReceiver sign:${d.receiver ? "  " + d.receiver : ""}`, { size: 11, wrap: true });
  ws.getRow(tr + 1).height = 33; ws.getRow(tr + 2).height = 42;

  for (let r = 1; r <= tr + 2; r++) for (let c = 1; c <= 10; c++) ws.getRow(r).getCell(c).border = BORDER;

  const buf = await wb.xlsx.writeBuffer();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  a.download = `${d.orderNo || "delivery"}.xlsx`;
  a.click(); URL.revokeObjectURL(a.href);
}
