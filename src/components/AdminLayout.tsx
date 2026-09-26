import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, UtensilsCrossed, LogOut, Menu as MenuIcon, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/utils/auth-context";
import { ROUTES } from "@/utils/routes";

const ADMIN_NAV = [
  { label: "Home", to: ROUTES.adminDashboard, icon: Home },
  { label: "Orders", to: ROUTES.adminOrders, icon: ClipboardList },
  { label: "Menu", to: ROUTES.adminMenu, icon: UtensilsCrossed },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleSignOut = () => {
    signOut();
    nav({ to: ROUTES.adminSignIn });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
              Admin
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {ADMIN_NAV.map((n) => {
              const active = pathname === n.to;
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    active ? "bg-primary-soft text-secondary" : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button onClick={handleSignOut} variant="outline" size="sm" className="hidden sm:inline-flex rounded-full">
              <LogOut className="h-4 w-4 mr-1.5" /> Sign out
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="px-4 py-3 flex flex-col gap-1">
              {ADMIN_NAV.map((n) => {
                const Icon = n.icon;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" /> {n.label}
                  </Link>
                );
              })}
              <Button onClick={handleSignOut} variant="outline" size="sm" className="mt-2 rounded-full">
                <LogOut className="h-4 w-4 mr-1.5" /> Sign out
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
