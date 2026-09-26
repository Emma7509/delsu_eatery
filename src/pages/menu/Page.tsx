import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/MenuItemCard";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { useCart } from "@/utils/cart-context";
import { useMenu, CATEGORIES, type MenuItem } from "@/utils/menu-context";

const CATS = ["All", ...CATEGORIES] as const;
const CATEGORY_ORDER = [
  "Special Menu",
  "Local Dishes",
  "Swallow",
  "Protein",
  "Snacks",
  "Sides",
  "Drinks",
];

export default function MenuPage({ initialCategory }: { initialCategory?: string }) {
  const [cat, setCat] = useState<string>(
    initialCategory && (CATS as readonly string[]).includes(initialCategory)
      ? initialCategory
      : "All",
  );
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<MenuItem | null>(null);
  const { viewItem } = useCart();
  const { items: menu } = useMenu();

  const items = useMemo(
    () =>
      menu
        .filter(
          (i) =>
            (cat === "All" || i.category === cat) &&
            i.name.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) => {
          const catDiff = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
          if (catDiff !== 0) return catDiff;
          return b.price - a.price;
        }),
    [cat, query, menu],
  );

  const openItem = (i: MenuItem) => {
    viewItem(i);
    setActive(i);
  };

  return (
    <PageLayout>
      <section className="bg-gradient-hero py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Our Kitchen
          </span>
          <h1 className="mt-2 text-4xl sm:text-5xl font-display font-bold leading-tight">
            Today's full menu
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Fresh ingredients, sourced locally in Abraka. Tap any dish to see the full story.
          </p>

          <div className="mt-6 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dishes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-11 h-12 rounded-full bg-background border-border"
            />
          </div>
        </div>
      </section>

      <section id="menu" className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-2 px-2 mb-8 scrollbar-none">
            {CATS.map((c) => (
              <Button
                key={c}
                variant={cat === c ? "default" : "outline"}
                onClick={() => setCat(c)}
                className={`rounded-full shrink-0 ${cat === c ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : ""}`}
              >
                {c}
              </Button>
            ))}
          </div>

          {items.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">No dishes match that filter.</p>
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={() => {
                  setCat("All");
                  setQuery("");
                }}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((item) => (
                <MenuItemCard key={item.id} item={item} onView={openItem} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ItemDetailModal item={active} open={!!active} onClose={() => setActive(null)} />
    </PageLayout>
  );
}
