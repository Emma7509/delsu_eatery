import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/utils/auth-context";
import { useAdminOrders, type Order, type OrderStatus } from "@/utils/orders-context";
import { formatNaira, formatDate } from "@/utils/format";
import { ROUTES } from "@/utils/routes";
import { toast } from "sonner";

const STATUSES: OrderStatus[] = ["Received", "Preparing", "Delivered"];

export default function AdminOrdersPage() {
  const { isAdmin, authReady } = useAuth();
  const { orders, updateStatus } = useAdminOrders();
  const nav = useNavigate();
  const [filter, setFilter] = useState<"All" | OrderStatus>("All");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (authReady && !isAdmin) nav({ to: ROUTES.adminSignIn });
  }, [authReady, isAdmin, nav]);

  const list = (filter === "All" ? orders : orders.filter((o) => o.status === filter)).sort(
    (a, b) => +new Date(b.date) - +new Date(a.date),
  );

  const active = orders.find((o) => o.id === activeId) || null;

  const setStatus = (o: Order, s: OrderStatus) => {
    updateStatus(o.id, s);
    toast.success(`Marked as ${s}`);
  };

  const advance = (o: Order) => {
    const next = STATUSES[Math.min(STATUSES.indexOf(o.status) + 1, STATUSES.length - 1)];
    setStatus(o, next);
  };

  return (
    <AdminLayout>
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Admin
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold mb-6">
            Orders Management
          </h1>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(["All", ...STATUSES] as const).map((s) => (
              <Button
                key={s}
                variant={filter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(s)}
                className={`rounded-full shrink-0 ${filter === s ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : ""}`}
              >
                {s}
                {s !== "All" && ` (${orders.filter((o) => o.status === s).length})`}
              </Button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-6">
            <div className="space-y-3">
              {list.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setActiveId(o.id)}
                  className={`w-full text-left bg-card border rounded-2xl p-5 hover:shadow-soft transition-all ${
                    active?.id === o.id ? "border-secondary" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-display font-semibold">{o.reference}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.customer.name} · {formatDate(o.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-soft text-secondary">
                        {o.status}
                      </span>
                      <span className="font-bold text-secondary">{formatNaira(o.total)}</span>
                    </div>
                  </div>
                </button>
              ))}
              {list.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-10 bg-muted/30 rounded-2xl border border-dashed border-border">
                  No orders in this view yet.
                </p>
              )}
            </div>

            <aside className="bg-card border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-20">
              {active ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Reference
                    </p>
                    <h3 className="font-display text-lg font-bold">{active.reference}</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Paystack: {active.paymentRef}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      {active.method === "pickup" ? "Pickup contact" : "Delivery to"}
                    </p>
                    <p className="text-sm font-medium">{active.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{active.customer.email}</p>
                    <p className="text-xs text-muted-foreground">{active.customer.phone}</p>
                    {active.customer.address && (
                      <p className="text-xs text-muted-foreground">{active.customer.address}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      Items
                    </p>
                    <ul className="space-y-1.5 text-sm">
                      {active.items.map((i) => (
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
                    <span className="text-secondary">{formatNaira(active.total)}</span>
                  </div>
                  <div className="pt-2 space-y-2">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Update status
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {STATUSES.map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={active.status === s ? "default" : "outline"}
                          onClick={() => setStatus(active, s)}
                          className={`rounded-full ${active.status === s ? "bg-secondary text-secondary-foreground" : ""}`}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                    {active.status !== "Delivered" && (
                      <Button
                        onClick={() => advance(active)}
                        className="w-full mt-2 rounded-full bg-gradient-primary text-primary-foreground"
                      >
                        Advance to next step →
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Select an order to view details.
                </p>
              )}
            </aside>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
