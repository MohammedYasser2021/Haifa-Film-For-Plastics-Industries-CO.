import ExcelJS from "exceljs";

const thin = { style: "thin" };
const BORDER = { top: thin, left: thin, bottom: thin, right: thin };

// kinds per column: text | int | num | money ; sumCols = column indexes to total with SUM formulas
export async function exportTable({ filename, sheet = "Report", title, headers, rows, kinds, sumCols = [], currency = "" }) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheet);
  const fmts = { int: "#,##0", num: "#,##0.00", money: `#,##0.00" ${currency}"`, text: "@" };
  const n = headers.length;

  ws.mergeCells(1, 1, 1, n);
  ws.getCell(1, 1).value = title;
  ws.getCell(1, 1).font = { name: "Arial", size: 14, bold: true };
  ws.getCell(1, 1).alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 28;

  const hr = ws.getRow(2);
  headers.forEach((h, i) => {
    const c = hr.getCell(i + 1);
    c.value = h; c.font = { name: "Arial", bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
    c.alignment = { horizontal: "center", vertical: "middle", wrapText: true }; c.border = BORDER;
  });
  hr.height = 24;

  rows.forEach((r, ri) => {
    const row = ws.getRow(3 + ri);
    r.forEach((v, i) => {
      const c = row.getCell(i + 1);
      c.value = v; c.numFmt = fmts[kinds[i]]; c.border = BORDER; c.font = { name: "Arial", size: 10 };
      c.alignment = { horizontal: kinds[i] === "text" ? "left" : "center", vertical: "middle" };
    });
  });

  if (sumCols.length && rows.length) {
    const tr = ws.getRow(3 + rows.length);
    for (let i = 0; i < n; i++) {
      const c = tr.getCell(i + 1);
      c.border = BORDER; c.font = { name: "Arial", bold: true }; c.alignment = { horizontal: "center" };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
      if (i === 0) c.value = "Total / 合计";
      if (sumCols.includes(i)) {
        const col = ws.getColumn(i + 1).letter;
        c.value = { formula: `SUM(${col}3:${col}${2 + rows.length})`, result: rows.reduce((s, r) => s + (Number(r[i]) || 0), 0) };
        c.numFmt = fmts[kinds[i]];
      }
    }
  }
  headers.forEach((h, i) => {
    const max = Math.max(String(h).length, ...rows.map((r) => String(r[i] ?? "").length));
    ws.getColumn(i + 1).width = Math.min(Math.max(max + 4, 12), 40);
  });

  const buf = await wb.xlsx.writeBuffer();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  a.download = filename; a.click(); URL.revokeObjectURL(a.href);
}
