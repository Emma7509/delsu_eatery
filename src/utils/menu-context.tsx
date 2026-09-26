import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "./supabase-client";
import { optimizedImage } from "./cloudinary-url";

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  rating: number;
  orderCount: number;
};

export const CATEGORIES = [
  "Special Menu",
  "Local Dishes",
  "Swallow",
  "Protein",
  "Snacks",
  "Drinks",
  "Sides",
] as const;

export const POPULAR_THRESHOLD = 10;
export function isPopular(item: MenuItem) {
  return item.orderCount >= POPULAR_THRESHOLD;
}

type Ctx = {
  items: MenuItem[];
  loading: boolean;
  addItem: (item: Omit<MenuItem, "id">) => Promise<MenuItem | null>;
  updateItem: (id: string, patch: Partial<MenuItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItem: (id: string) => MenuItem | undefined;
};

const MenuCtx = createContext<Ctx | null>(null);

type DbRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  description: string | null;
  rating: number | null;
  order_count: number | null;
};

function fromDb(row: DbRow): MenuItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    image: optimizedImage(row.image_url ?? ""),
    description: row.description ?? "",
    rating: row.rating ?? 4.5,
    orderCount: row.order_count ?? 0,
  };
}

export function MenuProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load menu:", error.message);
      setLoading(false);
      return;
    }
    setItems((data as DbRow[]).map(fromDb));
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem: Ctx["addItem"] = async (item) => {
    const { data, error } = await supabase
      .from("menu")
      .insert({
        name: item.name,
        category: item.category,
        price: item.price,
        image_url: item.image,
        description: item.description,
        rating: item.rating,
      })
      .select()
      .single();
    if (error) {
      console.error("Failed to add item:", error.message);
      return null;
    }
    const newItem = fromDb(data as DbRow);
    setItems((p) => [newItem, ...p]);
    return newItem;
  };

  const updateItem: Ctx["updateItem"] = async (id, patch) => {
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.price !== undefined) dbPatch.price = patch.price;
    if (patch.image !== undefined) dbPatch.image_url = patch.image;
    if (patch.description !== undefined) dbPatch.description = patch.description;
    if (patch.rating !== undefined) dbPatch.rating = patch.rating;

    const { error } = await supabase.from("menu").update(dbPatch).eq("id", id);
    if (error) {
      console.error("Failed to update item:", error.message);
      return;
    }
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const deleteItem: Ctx["deleteItem"] = async (id) => {
    const { error } = await supabase.from("menu").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete item:", error.message);
      return;
    }
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const getItem: Ctx["getItem"] = (id) => items.find((i) => i.id === id);

  return (
    <MenuCtx.Provider value={{ items, loading, addItem, updateItem, deleteItem, getItem }}>
      {children}
    </MenuCtx.Provider>
  );
}

export function useMenu() {
  const c = useContext(MenuCtx);
  if (!c) throw new Error("useMenu must be in MenuProvider");
  return c;
}
