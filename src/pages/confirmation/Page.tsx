import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Package } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/utils/format";
import { ROUTES } from "@/utils/routes";
import { useOrders, type Order } from "@/utils/orders-context";

export default function ConfirmationPage() {
  const { orders } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem("delsu-last-order-id");
    if (id) setOrder(orders.find((o) => o.id === id) || null);
  }, [orders]);

  return (
    <PageLayout>
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-accent/15 grid place-items-center">
            <CheckCircle2 className="h-10 w-10 text-accent" />
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl font-display font-bold">Order placed!</h1>
          <p className="mt-2 text-muted-foreground">
            Thank you{order?.customer.name ? `, ${order.customer.name}` : ""}. Your meal is being
            prepared.
          </p>

          {order && (
            <div className="mt-8 text-left bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Reference
                  </p>
                  <p className="font-display font-bold text-lg">{order.reference}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Paystack ref: {order.paymentRef}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold">
                  {order.status}
                </span>
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

              <div className="border-t border-border pt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatNaira(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{order.deliveryFee === 0 ? "Free" : formatNaira(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between pt-2 font-semibold">
                  <span>Total paid</span>
                  <span className="text-secondary">{formatNaira(order.total)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to={ROUTES.orders}>
              <Button className="rounded-full bg-gradient-primary text-primary-foreground">
                <Package className="h-4 w-4 mr-2" />
                Track order
              </Button>
            </Link>
            <Link to={ROUTES.menu}>
              <Button variant="outline" className="rounded-full">
                Order more
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
