import { useEffect, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Package, ChefHat, Bike, ChevronRight, ClipboardList } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useOrders, type Order, type OrderStatus } from "@/utils/orders-context";
import { useAuth } from "@/utils/auth-context";
import { formatNaira, formatDate } from "@/utils/format";
import { ROUTES } from "@/utils/routes";

const STATUS_META: Record<OrderStatus, { icon: any; color: string }> = {
  Received: { icon: Package, color: "bg-primary/15 text-secondary" },
  Preparing: { icon: ChefHat, color: "bg-accent/15 text-accent" },
  Delivered: { icon: Bike, color: "bg-muted text-muted-foreground" },
};

export default function OrdersPage() {
  const [active, setActive] = useState<Order | null>(null);
  const { user, isGuest } = useAuth();
  const nav = useNavigate();

  const { orders: myOrders, refresh } = useOrders();

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (isGuest) nav({ to: ROUTES.auth });
  }, [isGuest, nav]);

  if (isGuest) return null;

  return (
    <PageLayout>
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold">Your Orders</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Track current orders and revisit past meals.
          </p>

          {myOrders.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {myOrders.map((o) => {
                const Meta = STATUS_META[o.status];
                const Icon = Meta.icon;
                return (
                  <button
                    key={o.id}
                    onClick={() => setActive(o)}
                    className="w-full text-left bg-card border border-border rounded-2xl p-4 sm:p-5 hover:border-secondary/40 hover:shadow-soft transition-all flex items-center gap-4"
                  >
                    <div
                      className={`h-12 w-12 rounded-xl grid place-items-center shrink-0 ${Meta.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display font-semibold">{o.reference}</p>
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${Meta.color}`}
                        >
                          {o.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {o.items.length} item{o.items.length > 1 ? "s" : ""} · {formatDate(o.date)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-secondary">{formatNaira(o.total)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <OrderDetail order={active} onClose={() => setActive(null)} />
    </PageLayout>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center rounded-3xl bg-muted/40 border border-dashed border-border">
      <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto" />
      <h3 className="mt-4 font-display font-semibold text-lg">No orders yet</h3>
      <p className="text-sm text-muted-foreground mt-1">Your order history will appear here.</p>
      <Link to={ROUTES.menu}>
        <Button className="mt-5 rounded-full bg-gradient-primary text-primary-foreground">
          Browse menu
        </Button>
      </Link>
    </div>
  );
}

function OrderDetail({ order, onClose }: { order: Order | null; onClose: () => void }) {
  if (!order) return null;
  const steps: OrderStatus[] = ["Received", "Preparing", "Delivered"];
  const currentStep = steps.indexOf(order.status);

  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogTitle className="font-display text-xl">{order.reference}</DialogTitle>
        <p className="text-xs text-muted-foreground">{formatDate(order.date)}</p>

        <div className="my-4 flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div
                className={`h-9 w-9 rounded-full grid place-items-center text-xs font-bold ${i <= currentStep ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${i < currentStep ? "bg-accent" : "bg-muted"}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground -mt-2 mb-4">
          {steps.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>

        <div className="space-y-3">
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {order.method === "pickup" ? "Pickup contact" : "Delivery to"}
            </p>
            <p className="text-sm font-medium">{order.customer.name}</p>
            <p className="text-xs text-muted-foreground">
              {order.customer.phone}
              {order.customer.address ? ` · ${order.customer.address}` : ""}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Items</p>
            <ul className="space-y-2 text-sm">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between">
                  <span>
                    {i.quantity} × {i.name}
                  </span>
                  <span className="font-semibold">{formatNaira(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-semibold">
            <span>Total</span>
            <span className="text-secondary">{formatNaira(order.total)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
