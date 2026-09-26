import { ArrowRight, Truck } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useMenu, type MenuItem } from "@/utils/menu-context";
import { useCart } from "@/utils/cart-context";
import { formatNaira } from "@/utils/format";
import { ROUTES } from "@/utils/routes";

function getTodaysSpecial(items: MenuItem[]): MenuItem | null {
  const pool = [
    ...items.filter((i) => i.category === "Special Menu"),
    ...items.filter((i) => i.category === "Local Dishes"),
  ];
  if (pool.length === 0) return null;

  const daysSinceEpoch = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  const index = daysSinceEpoch % pool.length;
  return pool[index];
}

export function DailySpecials() {
  const { items } = useMenu();
  const { add } = useCart();
  const nav = useNavigate();
  const item = getTodaysSpecial(items);

  if (!item) return null;

  const orderThis = () => {
    add(item, 1);
    nav({ to: ROUTES.cart });
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Today's Special
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-display font-bold">
            Made with you in mind
          </h2>
        </div>

        <button
          type="button"
          onClick={orderThis}
          className="group relative flex flex-col sm:flex-row items-center sm:justify-between overflow-hidden rounded-[28px] px-6  
          sm:px-14 sm:py-10 gap-6 sm:gap-0 transition-transform duration-300 ease-out hover:scale-[1.01] cursor-pointer text-left w-full"
        >
          {/* Free delivery line — mobile only */}
          <div className="justify-center order-1 sm:hidden flex gap-4">
            {/* <Truck className="h-5 w-5 shrink-0 text-secondary" /> */}
            <span className="text-center text-sm text-secondary" style={{ letterSpacing: "1px" }}>
              Free delivery on all orders above ₦10,000
            </span>
          </div>

          {/* Image + price + button — second on mobile, right column on desktop */}
          <div className="order-2 sm:order-2 relative z-10 flex sm:w-[40%] flex-col items-center">
            <div className="relative sm:absolute md:-top-3 md:right-3 lg:right-10 flex flex-col items-center justify-center text-secondary">
              <span className="text-base font-bold leading-none">{formatNaira(item.price)}</span>
            </div>

            <img
              src={item.image}
              alt={item.name}
              className="w-44 h-44 sm:w-70 sm:h-70 object-contain sm:scale-125"
              style={{ filter: "drop-shadow(0 22px 45px rgba(0,0,0,0.25))" }}
            />

            <p
              className="mt-3 text-lg text-secondary"
              style={{ fontFamily: "'Pacifico', cursive" }}
            >
              Made for you
            </p>

            <span className="mt-4 inline-flex items-center rounded-full px-8 py-3.5 text-primary-foreground font-bold text-sm bg-primary shadow-glow">
              Order Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </span>
          </div>

          {/* Name + description — third on mobile, left column on desktop */}
          <div className="order-3 sm:order-1 relative z-10 w-full sm:w-[55%] text-center sm:text-left">
            <h1
              className="uppercase leading-[0.9] tracking-wide text-secondary"
              style={{
                fontFamily: "'Anton', sans-serif",
                fontSize: "clamp(2.25rem, 5vw, 5rem)",
              }}
            >
              {item.name}
            </h1>

            {item.description && (
              <p className="mt-3 text-sm sm:text-base max-w-sm mx-auto sm:mx-0 text-muted-foreground">
                {item.description}
              </p>
            )}

            {/* Free delivery line — desktop only, sits under description */}
            <div className="mt-8 sm:mt-10 hidden sm:flex items-center gap-2 justify-center sm:justify-start">
              <Truck className="h-5 w-5 shrink-0 text-secondary" />
              <span
                className="text-sm sm:text-base text-secondary"
                style={{ letterSpacing: "1px" }}
              >
                Free delivery on all orders above ₦10,000
              </span>
            </div>
          </div>
        </button>
      </div>
    </section>
  );
}
