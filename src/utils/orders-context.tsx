import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase-client";

export type OrderStatus = "Received" | "Preparing" | "Delivered";
export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type Order = {
  id: string;
  reference: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  subtotal: number;
  deliveryFee: number;
  method: "delivery" | "pickup";
  paymentRef: string;
  customer: { name: string; email: string; phone: string; address: string };
};

type Ctx = {
  orders: Order[];
  loading: boolean;
  refresh: () => void;
};

const OrdersCtx = createContext<Ctx | null>(null);

type OrderRow = {
  id: string;
  reference: string;
  created_at: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  method: "delivery" | "pickup";
  payment_ref: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string | null;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
};

function buildOrder(row: OrderRow, itemRows: OrderItemRow[]): Order {
  return {
    id: row.id,
    reference: row.reference,
    date: row.created_at,
    status: row.status,
    items: itemRows.map((i) => ({
      id: i.menu_item_id ?? i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: i.image ?? undefined,
    })),
    total: row.total,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    method: row.method,
    paymentRef: row.payment_ref,
    customer: {
      name: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone,
      address: row.customer_address ?? "",
    },
  };
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchOrders = async (uid: string) => {
    setLoading(true);
    const { data: orderRows, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error || !orderRows) {
      setLoading(false);
      return;
    }

    const orderIds = orderRows.map((o) => o.id);
    const { data: itemRows } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds.length ? orderIds : ["00000000-0000-0000-0000-000000000000"]);

    const built = (orderRows as OrderRow[]).map((row) =>
      buildOrder(
        row,
        (itemRows as OrderItemRow[] | null)?.filter((i) => i.order_id === row.id) ?? [],
      ),
    );
    setOrders(built);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      if (uid) fetchOrders(uid);
      else setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) fetchOrders(uid);
      else setOrders([]);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Real-time: if admin changes a status, this user's tracking page updates itself, no refresh needed
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`orders-user-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${userId}` },
        () => fetchOrders(userId),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <OrdersCtx.Provider value={{ orders, loading, refresh: () => userId && fetchOrders(userId) }}>
      {children}
    </OrdersCtx.Provider>
  );
}

export function useOrders() {
  const c = useContext(OrdersCtx);
  if (!c) throw new Error("useOrders must be in OrdersProvider");
  return c;
}

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const { data: orderRows, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !orderRows) {
      setLoading(false);
      return;
    }

    const orderIds = orderRows.map((o) => o.id);
    const { data: itemRows } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds.length ? orderIds : ["00000000-0000-0000-0000-000000000000"]);

    const built = (orderRows as OrderRow[]).map((row) =>
      buildOrder(
        row,
        (itemRows as OrderItemRow[] | null)?.filter((i) => i.order_id === row.id) ?? [],
      ),
    );
    setOrders(built);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchAll())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, status } : o)));
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) fetchAll();
  };

  return { orders, loading, updateStatus };
}
