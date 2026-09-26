import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function createOrderFromIntent(
  admin: SupabaseClient,
  reference: string,
  verifiedAmountKobo: number,
): Promise<{ orderId: string } | { error: string; status: number }> {
  const { data: existingOrder } = await admin
    .from("orders")
    .select("id")
    .eq("reference", reference)
    .maybeSingle();
  if (existingOrder) return { orderId: existingOrder.id };

  const { data: intent, error: intentErr } = await admin
    .from("checkout_intents")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();
  if (intentErr || !intent) return { error: "No matching checkout intent found", status: 400 };

  const items = intent.items as { menu_item_id: string; quantity: number }[];
  const customer = intent.customer as {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };

  for (const i of items) {
    if (!i.menu_item_id || !Number.isInteger(i.quantity) || i.quantity <= 0) {
      return { error: "Invalid item quantity", status: 400 };
    }
  }

  const ids = items.map((i) => i.menu_item_id);
  const { data: menuRows, error: menuErr } = await admin
    .from("menu")
    .select("id, name, price, image_url")
    .in("id", ids);
  if (menuErr || !menuRows || menuRows.length !== ids.length) {
    return { error: "One or more menu items are invalid", status: 400 };
  }

  const lineItems = items.map((i) => {
    const menuItem = menuRows.find((m) => m.id === i.menu_item_id)!;
    return {
      menu_item_id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      image: menuItem.image_url,
      quantity: i.quantity,
    };
  });

  const subtotal = lineItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = intent.method === "pickup" || subtotal >= 10000 ? 0 : 300;
  const total = subtotal + deliveryFee;

  if (verifiedAmountKobo !== total * 100) {
    return { error: "Payment amount does not match order total", status: 400 }; //
  }

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      user_id: intent.user_id,
      reference,
      status: "Received",
      method: intent.method,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      payment_ref: reference,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      customer_address: customer.address ?? null,
    })
    .select()
    .single();

  if (orderErr || !order) return { error: "Failed to create order", status: 500 };

  const { error: itemsErr } = await admin.from("order_items").insert(
    lineItems.map((li) => ({
      order_id: order.id,
      menu_item_id: li.menu_item_id,
      name: li.name,
      price: li.price,
      quantity: li.quantity,
      image: li.image,
    })),
  );
  if (itemsErr) return { error: "Failed to save order items", status: 500 };

  await admin.from("checkout_intents").delete().eq("reference", reference);

  return { orderId: order.id };
}
