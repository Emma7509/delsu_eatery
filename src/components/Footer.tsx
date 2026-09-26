import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Instagram, Twitter, Facebook, UtensilsCrossed } from "lucide-react";
import { ROUTES } from "@/utils/routes";

export function Footer() {
  return (
    <footer className="mt-24 relative">
      <div className="relative -mt-10 rounded-t-[2.5rem] border-t border-border shadow-2xl bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 grid gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-background-foreground">Brand Statement</h4>
            <p className="text-sm text-background-foreground/70 max-w-xs">
              The official student-run eatery of Delta State University, Abraka. Authentic Nigerian
              meals, hostel-friendly delivery.
            </p>
            <div className="flex gap-2 pt-1">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 grid place-items-center rounded-full bg-muted border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-background-foreground mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm text-background-foreground/70">
              <li>
                <Link
                  to={ROUTES.menu}
                  className="hover:text-background-foreground transition-colors"
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.orders}
                  className="hover:text-background-foreground transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.cart}
                  className="hover:text-background-foreground transition-colors"
                >
                  Your Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-background-foreground mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-background-foreground/70">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                Delta State University, Campus 3, Abraka, Delta State.
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +234 000 000 0000
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                example@delsu.edu.ng
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-background-foreground mb-3">Hours</h4>
            <p className="text-sm text-background-foreground/70">
              Mon-Sat
              <br />
              7:00am — 10:00pm
            </p>
            <p className="mt-3 text-sm text-background-foreground/70">
              Sunday
              <br />
              12:00pm — 9:00pm
            </p>
          </div>
        </div>

        <div className="lg:py-20">
          <div className="px-4 sm:px-6 lg:px-8 pt-10 pb-4 flex justify-center items-center gap-4 sm:gap-6 font-bold font-['Bitcount_Grid_Double']">
            <UtensilsCrossed
              className="h-12 w-12 sm:h-20 sm:w-20 lg:h-27.5 lg:w-27.5 xl:h-35 xl:w-35 shrink-0 text-primary drop-shadow-2xl"
              strokeWidth={1.75}
              style={{ transform: "translateY(-14px)" }}
            />
            <span
              className="tracking-tight leading-none text-[40px] sm:text-[64px] lg:text-[90px] xl:text-[180px] text-primary"
              style={{ letterSpacing: "-0.02em", wordSpacing: "-0.3em" }}
            >
              DELSU Eatery
            </span>
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-background-foreground/70">
            <p>© {new Date().getFullYear()} DELSU Eatery · Delta State University, Abraka</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
