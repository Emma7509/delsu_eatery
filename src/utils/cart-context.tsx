import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/utils/supabase-client";
import { useMenu, type MenuItem } from "@/utils/menu-context";

export type { MenuItem };
export type CartItem = MenuItem & { quantity: number };

type CartCtxType = {
  items: CartItem[];
  recentlyViewed: MenuItem[];
  add: (item: MenuItem, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  viewItem: (item: MenuItem) => void;
  subtotal: number;
  count: number;
};

const CartCtx = createContext<CartCtxType | null>(null);
const GUEST_CART_KEY = "delsu-guest-cart";

type GuestCartLine = { menu_item_id: string; quantity: number };
type CartRow = { id: string; menu_item_id: string; quantity: number };

function readGuestCart(): GuestCartLine[] {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeGuestCart(lines: GuestCartLine[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(lines));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { items: menuItems } = useMenu();
  const [guestLines, setGuestLines] = useState<GuestCartLine[]>([]);
  const [rows, setRows] = useState<CartRow[]>([]);
  const [recentlyViewed, setRecent] = useState<MenuItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const prevUserId = useRef<string | null>(null);

  const fetchCart = async (uid: string) => {
    const { data, error } = await supabase
      .from("cart_items")
      .select("id, menu_item_id, quantity")
      .eq("user_id", uid);
    if (!error && data) setRows(data as CartRow[]);
  };

  const migrateGuestCartTo = async (uid: string) => {
    const guest = readGuestCart();
    if (guest.length === 0) return;
    for (const line of guest) {
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", uid)
        .eq("menu_item_id", line.menu_item_id)
        .maybeSingle();
      if (existing) {
        await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + line.quantity })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("cart_items")
          .insert({ user_id: uid, menu_item_id: line.menu_item_id, quantity: line.quantity });
      }
    }
    writeGuestCart([]);
    setGuestLines([]);
  };

  useEffect(() => {
    setGuestLines(readGuestCart());

    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      prevUserId.current = uid;
      if (uid) fetchCart(uid);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user?.id ?? null;
      const wasLoggedOut = !prevUserId.current;
      prevUserId.current = uid;
      setUserId(uid);
      if (uid) {
        if (wasLoggedOut) await migrateGuestCartTo(uid);
        fetchCart(uid);
      } else {
        setRows([]);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const items: CartItem[] = userId
    ? rows
        .map((row) => {
          const menuItem = menuItems.find((m) => m.id === row.menu_item_id);
          if (!menuItem) return null;
          return { ...menuItem, quantity: row.quantity };
        })
        .filter((i): i is CartItem => i !== null)
    : guestLines
        .map((line) => {
          const menuItem = menuItems.find((m) => m.id === line.menu_item_id);
          if (!menuItem) return null;
          return { ...menuItem, quantity: line.quantity };
        })
        .filter((i): i is CartItem => i !== null);

  const add: CartCtxType["add"] = (item, qty = 1) => {
    if (userId) {
      const existingRow = rows.find((r) => r.menu_item_id === item.id);
      if (existingRow) {
        const newQty = existingRow.quantity + qty;
        setRows((p) => p.map((r) => (r.id === existingRow.id ? { ...r, quantity: newQty } : r)));
        supabase.from("cart_items").update({ quantity: newQty }).eq("id", existingRow.id).then();
      } else {
        const tempId = `temp-${item.id}`;
        setRows((p) => [...p, { id: tempId, menu_item_id: item.id, quantity: qty }]);
        supabase
          .from("cart_items")
          .insert({ user_id: userId, menu_item_id: item.id, quantity: qty })
          .select()
          .single()
          .then(({ data }) => {
            if (data) setRows((p) => p.map((r) => (r.id === tempId ? (data as CartRow) : r)));
          });
      }
    } else {
      setGuestLines((p) => {
        const existing = p.find((l) => l.menu_item_id === item.id);
        const next = existing
          ? p.map((l) => (l.menu_item_id === item.id ? { ...l, quantity: l.quantity + qty } : l))
          : [...p, { menu_item_id: item.id, quantity: qty }];
        writeGuestCart(next);
        return next;
      });
    }
  };

  const remove: CartCtxType["remove"] = (id) => {
    if (userId) {
      const row = rows.find((r) => r.menu_item_id === id);
      if (!row) return;
      setRows((p) => p.filter((r) => r.id !== row.id));
      supabase.from("cart_items").delete().eq("id", row.id).then();
    } else {
      setGuestLines((p) => {
        const next = p.filter((l) => l.menu_item_id !== id);
        writeGuestCart(next);
        return next;
      });
    }
  };

  const setQty: CartCtxType["setQty"] = (id, qty) => {
    if (userId) {
      const row = rows.find((r) => r.menu_item_id === id);
      if (!row) return;
      if (qty <= 0) {
        setRows((p) => p.filter((r) => r.id !== row.id));
        supabase.from("cart_items").delete().eq("id", row.id).then();
      } else {
        setRows((p) => p.map((r) => (r.id === row.id ? { ...r, quantity: qty } : r)));
        supabase.from("cart_items").update({ quantity: qty }).eq("id", row.id).then();
      }
    } else {
      setGuestLines((p) => {
        const next =
          qty <= 0
            ? p.filter((l) => l.menu_item_id !== id)
            : p.map((l) => (l.menu_item_id === id ? { ...l, quantity: qty } : l));
        writeGuestCart(next);
        return next;
      });
    }
  };

  const clear = () => {
    if (userId) {
      setRows([]);
      supabase.from("cart_items").delete().eq("user_id", userId).then();
    } else {
      setGuestLines([]);
      writeGuestCart([]);
    }
  };

  const viewItem: CartCtxType["viewItem"] = (item) =>
    setRecent((p) => [item, ...p.filter((i) => i.id !== item.id)].slice(0, 6));

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartCtx.Provider
      value={{ items, recentlyViewed, add, remove, setQty, clear, viewItem, subtotal, count }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used in CartProvider");
  return ctx;
}
