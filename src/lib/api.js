import { supabase } from "./supabase";
import { num, parseNotes, composeNotes } from "./utils";

const fromRow = (r) => {
  const { notes, meta } = parseNotes(r.notes);
  return {
  measure: meta.measure === "other" || meta.unit === "kg" ? "other" : "m", unitName: meta.unitName ?? (meta.unit === "kg" ? "kg" : ""), measureTotal: meta.total ?? meta.kg ?? "",
  product: meta.product ?? "", sheet: meta.sheet ?? null,
  id: r.id, buyer: r.buyer, customerId: r.customer_id, orderNo: r.order_no, date: r.delivery_date, currency: r.currency,
  notes, receiver: r.receiver, updatedAt: r.updated_at, createdAt: r.created_at, scanPath: r.scan_path,
  items: [...(r.delivery_items || [])].sort((a, b) => a.position - b.position).map((i) => ({
    id: i.id, color: i.color, logo: i.logo, viscosity: i.viscosity,
    thickness: i.thickness, width: i.width, length: i.length, qty: i.qty, price: i.price,
  })),
  };
};

export async function fetchDeliveries() {
  const { data, error } = await supabase.from("deliveries").select("*, delivery_items(*)")
    .order("delivery_date", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
}

// header + rows are saved in ONE database transaction (see supabase-save-fn.sql)
export async function saveDelivery(d, isNew) {
  const payload = {
    id: d.id, is_new: isNew, updated_at: d.updatedAt || null,
    buyer: d.buyer, customer_id: d.customerId || null, order_no: d.orderNo, date: d.date, currency: d.currency, notes: composeNotes(d), receiver: d.receiver,
    items: d.items.map((i) => ({
      color: i.color, logo: i.logo, viscosity: i.viscosity,
      thickness: num(i.thickness), width: num(i.width), length: num(i.length), qty: num(i.qty), price: num(i.price),
    })),
  };
  const { error } = await supabase.rpc("save_delivery", { p: payload });
  if (error) throw error;
}

export async function deleteDelivery(id) {
  const { data, error } = await supabase.from("deliveries").delete().eq("id", id).select("id");
  if (error) throw error;
  if (!data.length) throw new Error("DENIED");
}

// several deliveries at once (the items are removed with them); returns how many were really deleted
export async function deleteDeliveries(ids) {
  let done = 0;
  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await supabase.from("deliveries").delete().in("id", ids.slice(i, i + 100)).select("id");
    if (error) throw error;
    done += data.length;
  }
  if (!done && ids.length) throw new Error("DENIED");
  return done;
}

// ---------- customers ----------
const toCustomer = (r) => ({ id: r.id, nameEn: r.name_en, nameZh: r.name_zh || "", code: r.code || "" });
export async function fetchCustomers() {
  const { data, error } = await supabase.from("customers").select("*").order("name_en");
  if (error) throw error;
  return data.map(toCustomer);
}
export async function saveCustomer(c) {
  const row = { name_en: c.nameEn.trim(), name_zh: c.nameZh.trim(), code: c.code.trim().toUpperCase() };
  const q = c.id ? supabase.from("customers").update(row).eq("id", c.id) : supabase.from("customers").insert(row);
  const { error } = await q;
  if (error) throw new Error(error.code === "23505" ? "EXISTS" : error.message);
}
export async function deleteCustomer(id) {
  const { data, error } = await supabase.from("customers").delete().eq("id", id).select("id");
  if (error) throw error;
  if (!data.length) throw new Error("DENIED");
}
