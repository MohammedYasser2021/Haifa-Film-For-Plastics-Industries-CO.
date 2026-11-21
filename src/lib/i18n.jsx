import React, { createContext, useContext, useState } from "react";
const dict = {
  en: { count: "Deliveries", item: "Item", subtitle: "Create, track and export your delivery lists", editTitle: "Edit delivery", title: "Delivery Lists", newDelivery: "New Delivery", buyer: "Buyer", orderNo: "Order No.", date: "Delivery Date", qty: "Quantity", sqm: "Total SQM", total: "Total", actions: "Actions", view: "View", edit: "Edit", delete: "Delete", excel: "Download Excel", pdf: "Download PDF", search: "Search buyer / order no.", from: "From", to: "To", currency: "Currency", all: "All", color: "Color", logo: "Logo", viscosity: "Viscosity", thickness: "Thickness (mic)", width: "Width (m)", length: "M/Roll (m)", price: "Unit Price / sqm", addRow: "Add row", notes: "Notes", receiver: "Receiver sign", save: "Save", cancel: "Cancel", confirmDelete: "Delete this delivery list?", empty: "No delivery lists found.", grandTotal: "All deliveries", details: "Delivery details", clear: "Clear filters", supplier: "Supplier", orderHint: "Format: HF + buyer code + YYYYMMDD, e.g. HFTBB20261101", rows: "Items", required: "Buyer, Order No. and at least one valid row are required." },
  zh: { count: "发货单数", item: "明细", subtitle: "创建、管理并导出发货清单", editTitle: "编辑发货单", title: "发货清单", newDelivery: "新建发货单", buyer: "买家", orderNo: "订单号", date: "发货日期", qty: "数量", sqm: "总平方数", total: "总价", actions: "操作", view: "查看", edit: "编辑", delete: "删除", excel: "下载 Excel", pdf: "下载 PDF", search: "搜索买家 / 订单号", from: "从", to: "至", currency: "货币", all: "全部", color: "颜色", logo: "印刷", viscosity: "粘度", thickness: "厚度 (mic)", width: "宽度 (米)", length: "米数 (米)", price: "单价 / 平方米", addRow: "添加行", notes: "备注", receiver: "收货人签字", save: "保存", cancel: "取消", confirmDelete: "确定删除此发货单？", empty: "没有找到发货单。", grandTotal: "全部发货单合计", details: "发货单详情", clear: "清除筛选", supplier: "卖家", orderHint: "格式：HF + 买家代码 + 年月日，例如 HFTBB20261101", rows: "明细", required: "买家、订单号和至少一行有效明细为必填项。" },
};
const Ctx = createContext();
export function I18nProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  const change = (l) => { localStorage.setItem("lang", l); setLang(l); };
  return <Ctx.Provider value={{ lang, setLang: change, t: (k) => dict[lang][k] || k }}>{children}</Ctx.Provider>;
}
export const useI18n = () => useContext(Ctx);
