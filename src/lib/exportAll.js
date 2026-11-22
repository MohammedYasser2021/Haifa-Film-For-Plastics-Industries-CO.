import ExcelJS from "exceljs";
import { itemSqm, itemTotal } from "./utils";

const save = (blob, name) => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href); };
const stamp = () => new Date().toISOString().slice(0, 10);

// Full backup as JSON (can be re-imported later)
export function exportJson(list, customers) {
  const data = { exportedAt: new Date().toISOString(), customers, deliveries: list };
  save(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `delivery-backup-${stamp()}.json`);
}

// Flat Excel: one line per delivery row + a customers sheet
export async function exportAllExcel(list, customers) {
  const wb = new ExcelJS.Workbook();
  const byId = new Map(customers.map((c) => [c.id, c]));
  const ws = wb.addWorksheet("Deliveries");
  const head = ["Order No", "Buyer", "Buyer (中文)", "Delivery Date", "Currency", "Color", "Logo", "Viscosity", "Thickness (mic)", "Width (m)", "M/Roll (m)", "Quantity", "Total SQM", "Unit Price", "Total", "Notes", "Receiver", "Created at"];
  ws.addRow(head);
  ws.getRow(1).eachCell((c) => { c.font = { bold: true, color: { argb: "FFFFFFFF" } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } }; c.alignment = { horizontal: "center" }; });
  [...list].sort((a, b) => a.date.localeCompare(b.date) || a.orderNo.localeCompare(b.orderNo)).forEach((d) => {
    d.items.forEach((i) => {
      const r = ws.addRow([d.orderNo, d.buyer, byId.get(d.customerId)?.nameZh || "", d.date, d.currency, i.color, i.logo, i.viscosity, +i.thickness, +i.width, +i.length, +i.qty, null, +i.price, null, d.notes, d.receiver, d.createdAt || ""]);
      const n = r.number;
      r.getCell(13).value = { formula: `J${n}*K${n}*L${n}`, result: itemSqm(i) };
      r.getCell(15).value = { formula: `M${n}*N${n}`, result: itemTotal(i) };
    });
  });
  ws.columns.forEach((c, i) => { c.width = [16, 20, 18, 13, 9, 14, 10, 10, 11, 10, 10, 10, 12, 11, 14, 24, 16, 22][i]; });
  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = { from: "A1", to: "R1" };

  const cs = wb.addWorksheet("Customers");
  cs.addRow(["Name (English)", "Name (中文)", "Code"]);
  cs.getRow(1).font = { bold: true };
  customers.forEach((c) => cs.addRow([c.nameEn, c.nameZh, c.code]));
  cs.columns.forEach((c) => { c.width = 28; });

  save(new Blob([await wb.xlsx.writeBuffer()], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `delivery-backup-${stamp()}.xlsx`);
}
