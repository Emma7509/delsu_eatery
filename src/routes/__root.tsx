import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { ThemeProvider } from "@/utils/theme-context";
import { CartProvider } from "@/utils/cart-context";
import { AuthProvider } from "@/utils/auth-context";
import { MenuProvider } from "@/utils/menu-context";
import { OrdersProvider } from "@/utils/orders-context";
import { ScriptOnce } from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display font-bold">404</h1>
        <p className="mt-4 text-muted-foreground">This page is not on the menu.</p>
        <a
          href="/"
          className="mt-6 inline-flex rounded-full bg-gradient-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold"
        >
          Back to home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DELSU Eatery — Campus Food Ordering & Delivery" },
      {
        name: "description",
        content:
          "The official student-run eatery of Delta State University, Abraka. Order authentic Nigerian meals delivered to your hostel or faculty.",
      },
      { property: "og:title", content: "DELSU Eatery — Campus Food Ordering" },
      {
        property: "og:description",
        content: "Order campus meals fast. Built for DELSU Abraka students.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bitcount+Grid+Double:wght@100..900&family=Bitcount+Prop+Single:wght@100..900&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Pacifico&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ScriptOnce
          children={`
            (function () {
              try {
                var stored = localStorage.getItem('delsu-theme');
                var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') document.documentElement.classList.add('dark');
              } catch (e) {}
            })();
          `}
        />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <MenuProvider>
            <OrdersProvider>
              <CartProvider>
                <Outlet />
                <Toaster position="top-center" />
              </CartProvider>
            </OrdersProvider>
          </MenuProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
