import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Banknote,
  UtensilsCrossed,
  ClipboardList,
  ArrowRight,
  UserCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { useAuth } from "@/utils/auth-context";
import { useAdminOrders } from "@/utils/orders-context";
import { useMenu } from "@/utils/menu-context";
import { formatNaira } from "@/utils/format";
import { ROUTES } from "@/utils/routes";

export default function AdminDashboardPage() {
  const { isAdmin, authReady } = useAuth();
  const { orders } = useAdminOrders();
  const { items: menuItems } = useMenu();
  const nav = useNavigate();

  useEffect(() => {
    if (authReady && !isAdmin) nav({ to: ROUTES.adminSignIn });
  }, [authReady, isAdmin, nav]);

  const todayKey = new Date().toDateString();
  const today = orders.filter((o) => new Date(o.date).toDateString() === todayKey);
  const revenueToday = today.reduce((s, o) => s + o.total, 0);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status !== "Delivered").length;

  return (
    <AdminLayout>
      <section className="py-10 sm:py-14 bg-muted/30 min-h-[calc(100vh-4rem)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Admin · Overview
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">
                Today at a glance
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-NG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <Stat
              icon={ShoppingBag}
              label="Orders today"
              value={today.length.toString()}
              sub={`${orders.length} all-time`}
            />
            <Stat
              icon={Banknote}
              label="Revenue today"
              value={formatNaira(revenueToday)}
              sub={`${formatNaira(totalRevenue)} all-time`}
            />
            <Stat
              icon={TrendingUp}
              label="Avg order"
              value={formatNaira(today.length ? revenueToday / today.length : 0)}
              sub="Today"
            />
            <Stat
              icon={ClipboardList}
              label="Pending"
              value={pending.toString()}
              sub="Need fulfilment"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <QuickLink
              to={ROUTES.adminMenu}
              icon={UtensilsCrossed}
              title="Menu Management"
              desc={`${menuItems.length} items · add, edit, remove`}
            />
            <QuickLink
              to={ROUTES.adminOrders}
              icon={ClipboardList}
              title="Orders Management"
              desc="Track and update live orders"
              badge={pending}
            />
          </div>

          <div className="mt-8 bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Recent orders</h2>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No orders have been placed yet. Customer orders will appear here.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {orders.slice(0, 6).map((o) => (
                  <li key={o.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <UserCircle className="h-8 w-8 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {o.reference} · {o.customer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {o.items.length} items · {o.method}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-soft text-secondary shrink-0">
                      {o.status}
                    </span>
                    <span className="font-semibold shrink-0">{formatNaira(o.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

function Stat({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-soft transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-display font-bold">{value}</p>
          <p className="text-xs text-accent mt-1">{sub}</p>
        </div>
        <div className="h-11 w-11 rounded-xl bg-primary-soft text-secondary grid place-items-center">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, title, desc, badge }: any) {
  return (
    <Link
      to={to}
      className="group bg-card border border-border rounded-2xl p-6 hover:border-secondary/40 hover:shadow-soft transition-all flex items-center gap-5"
    >
      <div className="relative h-14 w-14 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center shrink-0">
        <Icon className="h-7 w-7" />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 grid place-items-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold">
            {badge}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}
