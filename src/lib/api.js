import { supabase } from "./supabase";
import { num } from "./utils";

const fromRow = (r) => ({
  id: r.id, buyer: r.buyer, orderNo: r.order_no, date: r.delivery_date, currency: r.currency,
  notes: r.notes, receiver: r.receiver, updatedAt: r.updated_at, createdAt: r.created_at, scanPath: r.scan_path,
  items: [...(r.delivery_items || [])].sort((a, b) => a.position - b.position).map((i) => ({
    id: i.id, color: i.color, logo: i.logo, viscosity: i.viscosity,
    thickness: i.thickness, width: i.width, length: i.length, qty: i.qty, price: i.price,
  })),
});

export async function fetchDeliveries() {
  const { data, error } = await supabase.from("deliveries").select("*, delivery_items(*)")
    .order("delivery_date", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
}

export async function saveDelivery(d, isNew) {
  const head = { buyer: d.buyer, order_no: d.orderNo, delivery_date: d.date, currency: d.currency, notes: d.notes, receiver: d.receiver };
  if (isNew) {
    const { error } = await supabase.from("deliveries").insert({ id: d.id, ...head });
    if (error) throw error;
  } else {
    // only saves if nobody changed it since we loaded it
    const { data, error } = await supabase.from("deliveries").update(head).eq("id", d.id).eq("updated_at", d.updatedAt).select("id");
    if (error) throw error;
    if (!data.length) throw new Error("CONFLICT");
    const { error: e2 } = await supabase.from("delivery_items").delete().eq("delivery_id", d.id);
    if (e2) throw e2;
  }
  const rows = d.items.map((i, idx) => ({
    delivery_id: d.id, position: idx, color: i.color, logo: i.logo, viscosity: i.viscosity,
    thickness: num(i.thickness), width: num(i.width), length: num(i.length), qty: num(i.qty), price: num(i.price),
  }));
  const { error } = await supabase.from("delivery_items").insert(rows);
  if (error) throw error;
}

export async function deleteDelivery(id) {
  const { data, error } = await supabase.from("deliveries").delete().eq("id", id).select("id");
  if (error) throw error;
  if (!data.length) throw new Error("DENIED");
}
