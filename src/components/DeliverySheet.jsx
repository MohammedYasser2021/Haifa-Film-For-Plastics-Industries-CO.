import React from "react";
import { SUPPLIER, totals, itemSqm, itemTotal, plain, money, cnDate, specSpans } from "../lib/utils";

// Pixel layout copied from the original Excel (column widths / row heights in pt * 1.333)
const W = [88, 72, 72, 82, 93, 80, 80, 86, 74, 150];
const cell = "border border-black px-1 align-middle text-center";

export default function DeliverySheet({ delivery: d, exporting = false }) {
  const T = totals(d);
  const spans = specSpans(d.items);
  const px = (pt) => ({ height: pt * 1.333 });
  return (
    <>
    {exporting && <style>{".exp td{padding-top:0 !important;padding-bottom:9px !important;line-height:1.15 !important}"}</style>}
    <table className={exporting ? "exp" : ""} style={{ width: W.reduce((a, b) => a + b), borderCollapse: "collapse", tableLayout: "fixed", fontFamily: '"Microsoft YaHei","微软雅黑","Noto Sans SC",sans-serif', background: "#fff", color: "#000" }}>
      <colgroup>{W.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
      <tbody>
        {[["Supplier (卖家)", SUPPLIER], ["Buyer (买家)", d.buyer], ["Order No. (订单号)", d.orderNo]].map(([l, v]) => (
          <tr key={l} style={px(25)} className="text-[16px]">
            <td colSpan={6} className={`${cell} !text-right pr-2`}>{l}</td>
            <td colSpan={4} className={cell}>{v}</td>
          </tr>
        ))}
        <tr style={px(25)} className="text-[14.7px] font-bold" >
          <td colSpan={6} className={cell} style={{ background: "#FFFF00" }}>Delivery Date（发货日期）</td>
          <td colSpan={4} className={cell} style={{ background: "#FFFF00" }}>{cnDate(d.date)}</td>
        </tr>
        <tr style={px(49.5)} className="text-[13.3px] font-bold">
          {["Color\n(颜色)", "Logo\n(印刷)", "Viscosity\n(粘度)", "Thickness\n(厚度/MM)", "Width\n(宽度/M)", "M/Roll\n(米数/M)", "Quantity\n(数量/Roll)", "Total SQM\n(总平方数/M2)", "Unit Price\n/sqm\n(单价)", "Total\n(总价)"].map((h) => (
            <td key={h} className={cell} style={{ whiteSpace: "pre-line" }}>{h}</td>
          ))}
        </tr>
        {d.items.map((it, idx) => (
          <tr key={it.id} style={px(23)} className="text-[13.3px]">
            {spans[idx] > 0 && [it.color, it.logo, it.viscosity, `${it.thickness} mic`].map((v, k) => (
              <td key={k} rowSpan={spans[idx]} className={cell}>{v}</td>
            ))}
            <td className={cell}>{plain(it.width || 0)}</td>
            <td className={cell}>{plain(it.length || 0)}</td>
            <td className={cell}>{plain(it.qty || 0)}</td>
            <td className={cell}>{plain(itemSqm(it))}</td>
            <td className={cell}>{d.currency} {money(it.price || 0)}</td>
            <td className={cell}>{d.currency} {money(itemTotal(it))}</td>
          </tr>
        ))}
        <tr style={{ ...px(23), background: "#BFBFBF", color: "#C00000" }} className="text-[13.3px] font-bold">
          <td className={cell}>Total</td><td className={cell} />
          <td colSpan={4} className={cell} />
          <td className={cell}>{plain(T.qty)}</td>
          <td className={cell}>{T.sqm.toFixed(1)}</td>
          <td className={cell} />
          <td className={cell}>{d.currency} {money(T.total, 3)}</td>
        </tr>
        <tr style={px(33)} className="text-[14.7px]">
          <td className={cell} style={{ whiteSpace: "pre-line" }}>{"Notes\n备注"}</td>
          <td colSpan={9} className={`${cell} !text-left whitespace-pre-wrap`}>{d.notes}</td>
        </tr>
        <tr style={px(42)} className="text-[14.7px]">
          <td colSpan={10} className={cell} style={{ whiteSpace: "pre-line" }}>{"收货人签字\nReceiver sign:"}{d.receiver ? `  ${d.receiver}` : ""}</td>
        </tr>
      </tbody>
    </table>
    </>
  );
}
