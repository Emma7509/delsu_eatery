import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { ItemDetailModal } from "@/components/ItemDetailModal";
import { useCart, type MenuItem } from "@/utils/cart-context";
import { formatNaira } from "@/utils/format";
import { ROUTES } from "@/utils/routes";

export default function CartPage() {
  const { items, recentlyViewed, setQty, remove, subtotal } = useCart();
  const [active, setActive] = useState<MenuItem | null>(null);
  const delivery = subtotal >= 10000 || subtotal === 0 ? 0 : 300;
  const total = subtotal + delivery;

  return (
    <PageLayout>
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 rounded-xl bg-primary-soft border border-primary/20 px-4 py-2.5 text-sm text-center font-medium text-secondary flex items-center justify-center gap-2">
            <Truck className="h-4 w-4" />
            Free delivery on all orders above ₦10,000
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Your Cart</h1>
          <p className="text-sm text-muted-foreground mb-8">
            {items.length === 0
              ? "Empty for now — let's fix that."
              : `${items.length} item${items.length > 1 ? "s" : ""} ready to go.`}
          </p>

          {items.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-muted/50 border border-dashed border-border">
              <div className="mx-auto h-20 w-20 rounded-full bg-background grid place-items-center mb-4 shadow-soft">
                <ShoppingBag className="h-9 w-9 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-display font-semibold">Your cart is empty</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Browse the menu and add a meal to get started.
              </p>
              <Link to={ROUTES.menu}>
                <Button className="mt-6 rounded-full bg-gradient-primary text-primary-foreground">
                  Explore menu
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_380px] gap-8">
              <div className="space-y-3">
                {items.map((i) => (
                  <div
                    key={i.id}
                    className="flex gap-4 bg-card border border-border rounded-2xl p-4"
                  >
                    <img
                      src={i.image}
                      alt={i.name}
                      className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{i.name}</h3>
                          <p className="text-xs text-muted-foreground">{i.category}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => remove(i.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-auto pt-3 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-full"
                            onClick={() => setQty(i.id, i.quantity - 1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-7 text-center text-sm font-semibold">
                            {i.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-full"
                            onClick={() => setQty(i.id, i.quantity + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {formatNaira(i.price)} each
                          </p>
                          <p className="text-sm font-bold text-secondary">
                            {formatNaira(i.price * i.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="bg-card border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-20 space-y-4">
                <h3 className="font-display text-lg font-semibold">Order summary</h3>
                <div className="space-y-2 text-sm">
                  <Row label="Subtotal" value={formatNaira(subtotal)} />
                  <Row
                    label="Delivery fee"
                    value={delivery === 0 ? "Free" : formatNaira(delivery)}
                  />
                  {delivery === 0 && subtotal > 0 && (
                    <p className="text-xs text-accent">Free delivery unlocked 🎉</p>
                  )}
                </div>
                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-display font-bold text-secondary">
                    {formatNaira(total)}
                  </span>
                </div>
                <Link to={ROUTES.checkout}>
                  <Button className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-glow">
                    Proceed to Checkout <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </aside>
            </div>
          )}

          {recentlyViewed.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-display font-bold mb-5">Recently viewed</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {recentlyViewed.map((r) => (
                  <button key={r.id} onClick={() => setActive(r)} className="text-left group">
                    <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                      <img
                        src={r.image}
                        alt={r.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <p className="mt-2 text-xs font-medium truncate">{r.name}</p>
                    <p className="text-xs text-secondary font-semibold">{formatNaira(r.price)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <ItemDetailModal item={active} open={!!active} onClose={() => setActive(null)} />
    </PageLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
