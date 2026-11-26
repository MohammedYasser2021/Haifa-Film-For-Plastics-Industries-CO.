import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import DeliverySheet from "../components/DeliverySheet";

// Same page size / table position & width as the original PDF (334.463 x 842.01 pt)
export async function exportPdf(d, { lang = "en", buyer } = {}) {
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-10000px;top:0;background:#fff";
  document.body.appendChild(host);
  const root = createRoot(host);
  flushSync(() => root.render(React.createElement(DeliverySheet, { delivery: d, exporting: true, lang, buyer })));
  await document.fonts?.ready;
  const canvas = await html2canvas(host, { scale: 3, backgroundColor: "#fff" });
  root.unmount(); host.remove();
  const pdf = new jsPDF({ unit: "pt", format: [334.463, 842.01] });
  const w = 232, h = (canvas.height / canvas.width) * w;
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 51, 54, w, h);
  pdf.save(`${d.orderNo || "delivery"}.pdf`);
}
