import { useState, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { CreditCard, Truck, Store, Lock } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/utils/cart-context";
import { useAuth } from "@/utils/auth-context";
import { supabase } from "@/utils/supabase-client";
import { loadPaystackScript, payWithPaystack } from "@/utils/paystack";
import { formatNaira } from "@/utils/format";
import { ROUTES } from "@/utils/routes";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [method, setMethod] = useState<"delivery" | "pickup">("delivery");
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  useEffect(() => {
    loadPaystackScript().catch(() => toast.error("Failed to load payment gateway"));
  }, []);

  useEffect(() => {
    if (user)
      setForm((f) => ({
        name: f.name || user.name,
        email: f.email || user.email,
        phone: f.phone || user.phone,
        address: f.address || user.address,
      }));
  }, [user]);

  const delivery = method === "pickup" || subtotal >= 10000 ? 0 : 300;
  const total = subtotal + delivery;

  if (items.length === 0) {
    return (
      <PageLayout>
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to={ROUTES.menu}>
            <Button className="mt-4 rounded-full bg-gradient-primary text-primary-foreground">
              Browse menu
            </Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const guardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to place an order");
      nav({ to: ROUTES.auth });
      return;
    }
    if (!form.name || !form.email || !form.phone || (method === "delivery" && !form.address)) {
      toast.error("Please complete your contact details");
      return;
    }

    setProcessing(true);
    const reference = `DELSU-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const { error: intentError } = await supabase.functions.invoke("create-checkout-intent", {
      body: {
        reference,
        method,
        items: items.map((i) => ({ menu_item_id: i.id, quantity: i.quantity })),
        customer: form,
      },
    });

    if (intentError) {
      toast.error("Could not start checkout. Try again.");
      setProcessing(false);
      return;
    }

    payWithPaystack({
      email: form.email,
      amountNaira: total,
      reference,
      onSuccess: async (ref) => {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { reference: ref },
        });

        setProcessing(false);

        if (error || !data?.orderId) {
          toast.error(
            data?.error || "Payment received but order could not be confirmed. Contact support.",
          );
          return;
        }

        sessionStorage.setItem("delsu-last-order-id", data.orderId);
        clear();
        toast.success("Payment successful! Order placed.");
        nav({ to: ROUTES.confirmation });
      },
      onClose: () => {
        setProcessing(false);
      },
    });
  };

  return (
    <PageLayout>
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-8">Checkout</h1>

          <form onSubmit={guardSubmit} className="grid lg:grid-cols-[1fr_400px] gap-8">
            <div className="space-y-6">
              <Card title="Delivery method">
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      {
                        id: "delivery",
                        icon: Truck,
                        label: "Hostel Delivery",
                        desc: "₦300 · 15–25 min",
                      },
                      { id: "pickup", icon: Store, label: "Pickup", desc: "Free · 10 min" },
                    ] as const
                  ).map((opt) => {
                    const Icon = opt.icon;
                    const active = method === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setMethod(opt.id)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          active
                            ? "border-secondary bg-primary-soft"
                            : "border-border hover:border-secondary/40"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${active ? "text-secondary" : "text-muted-foreground"}`}
                        />
                        <p className="mt-2 font-semibold text-sm">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card title="Contact details">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Full name</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                {method === "delivery" && (
                  <div className="mt-4 space-y-1.5">
                    <Label>Hostel / Room / Faculty</Label>
                    <Textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="e.g. Hostel B, Room 204"
                      rows={3}
                      required
                    />
                  </div>
                )}
              </Card>

              <Card title="Payment">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-soft border border-primary/30">
                  <CreditCard className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-sm font-semibold">Paystack</p>
                    <p className="text-xs text-muted-foreground">Card, Bank Transfer, USSD or QR</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> You'll be redirected to Paystack's secure checkout.
                </p>
              </Card>
            </div>

            <aside className="bg-card border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-20 space-y-4">
              <h3 className="font-display text-lg font-semibold">Order summary</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {items.map((i) => (
                  <div key={i.id} className="flex items-center gap-3 text-sm">
                    <span className="h-6 w-6 rounded-full bg-muted grid place-items-center text-xs font-bold">
                      {i.quantity}
                    </span>
                    <span className="flex-1 truncate">{i.name}</span>
                    <span className="font-semibold">{formatNaira(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatNaira(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{delivery === 0 ? "Free" : formatNaira(delivery)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-display font-bold text-secondary">
                    {formatNaira(total)}
                  </span>
                </div>
              </div>
              <Button
                type="submit"
                disabled={processing}
                className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-glow disabled:opacity-60"
              >
                {processing ? "Processing..." : `Pay ${formatNaira(total)}`}
              </Button>
            </aside>
          </form>
        </div>
      </section>
    </PageLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="font-display text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}
