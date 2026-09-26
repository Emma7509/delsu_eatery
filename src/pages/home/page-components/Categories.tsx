import { Link } from "@tanstack/react-router";
import { ROUTES } from "@/utils/routes";
import { Sparkles, Soup, Utensils, Beef, Cookie, Wine, Salad } from "lucide-react";
import { useMenu } from "@/utils/menu-context";
import { useEffect, useState } from "react";

const CATEGORIES = [
  // { name: "Special Menu", icon: Sparkles, color: "bg-accent/15 text-accent" },
  { name: "Local Dishes", icon: Soup, color: "bg-primary-soft text-secondary" },
  { name: "Swallow", icon: Utensils, color: "bg-accent/15 text-accent" },
  { name: "Protein", icon: Beef, color: "bg-primary-soft text-secondary" },
  { name: "Snacks", icon: Cookie, color: "bg-accent/15 text-accent" },
  { name: "Drinks", icon: Wine, color: "bg-primary-soft text-secondary" },
  { name: "Sides", icon: Salad, color: "bg-accent/15 text-accent" },
];

export function Categories() {
  const { items } = useMenu();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Browse
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Pick your craving</h2>
          </div>
          {/* <Link to={ROUTES.menu} className="text-sm font-medium text-secondary hover:underline">
            View full menu
          </Link> */}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map((c, index) => {
            const Icon = c.icon;
            const count = items.filter((i) => i.category === c.name).length;

            return (
              <Link
                key={c.name}
                to={ROUTES.menu}
                search={{ category: c.name }}
                className={`group rounded-2xl bg-card p-5 shadow-soft hover:shadow-glow hover:-translate-y-1 transition-all duration-500 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <div
                  className={`h-12 w-12 rounded-xl grid place-items-center transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 ${c.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-4 font-semibold text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {count} {count === 1 ? "item" : "items"}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
