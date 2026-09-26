import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/MenuItemCard";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { useCart } from "@/utils/cart-context";
import { useMenu, type MenuItem } from "@/utils/menu-context";
import { ROUTES } from "@/utils/routes";

export function Featured() {
  const [active, setActive] = useState<MenuItem | null>(null);
  const { viewItem } = useCart();
  const { items } = useMenu();

  const specials = items.filter((i) => i.category === "Special Menu").slice(0, 5);
  const topLocalDish = [...items]
    .filter((i) => i.category === "Local Dishes")
    .sort((a, b) => b.rating - a.rating)[0];

  const featured = topLocalDish ? [...specials, topLocalDish] : specials;

  const open = (i: MenuItem) => {
    viewItem(i);
    setActive(i);
  };

  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Featured
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold">
              A taste of the menu
            </h2>
          </div>
          <Link to={ROUTES.menu}>
            <Button variant="outline" className="rounded-full">
              See all
            </Button>
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">
            No dishes yet — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((item) => (
              <MenuItemCard key={item.id} item={item} onView={open} />
            ))}
          </div>
        )}
      </div>

      <ItemDetailModal item={active} open={!!active} onClose={() => setActive(null)} />
    </section>
  );
}
