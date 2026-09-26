import { ShoppingBag, ChefHat, Bike } from "lucide-react";

const STEPS = [
  {
    icon: ShoppingBag,
    title: "Place your order",
    desc: "Browse the menu and add your favourites to cart. Pay securely with Paystack.",
  },
  {
    icon: ChefHat,
    title: "We cook it fresh",
    desc: "Our chefs prepare your meal hot, never reheated. Track every step in real time.",
  },
  {
    icon: Bike,
    title: "Delivered to you",
    desc: "Hostel, faculty or pickup window; usually within 15 minutes.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            How it works
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold">
            From craving to plate in 3 steps
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="relative bg-card rounded-3xl border border-border p-7 hover:shadow-soft transition-shadow"
              >
                <div className="absolute -top-4 -left-2 h-10 w-10 rounded-full bg-secondary text-secondary-foreground grid place-items-center font-display font-bold text-lg shadow-soft">
                  {i + 1}
                </div>
                <div className="h-14 w-14 rounded-2xl bg-primary-soft text-secondary grid place-items-center mb-5">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
