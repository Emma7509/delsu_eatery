import { Wallet, ShieldCheck, Zap, Leaf, MapPinned, Smartphone } from "lucide-react";

const REASONS = [
  {
    icon: Wallet,
    title: "Student-Friendly Pricing",
    desc: "Real meals at prices that actually work on a student budget, no inflated campus markup.",
  },
  {
    icon: ShieldCheck,
    title: "Hygienic Preparation",
    desc: "Every dish is cooked in a clean kitchen, handled properly from prep to your plate.",
  },
  {
    icon: Zap,
    title: "Fast Service",
    desc: "Orders go from kitchen to hostel quickly, so you're not waiting around between classes.",
  },
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    desc: "Nothing sits around. We cook with what's fresh, not what's been sitting in storage.",
  },
  {
    icon: MapPinned,
    title: "Campus Convenience",
    desc: "Every hostel and faculty building is covered, so wherever you are, we can reach you.",
  },
  {
    icon: Smartphone,
    title: "Simple Digital Ordering",
    desc: "Order, pay, and track everything from your phone. No calls, no stress, no guesswork.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Why DELSU Eatery
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold">
            Why students choose us
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REASONS.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.title}
                className="bg-card rounded-2xl p-6 shadow-soft hover:scale-105 transition-all duration-300 ease-out"
              >
                <div className="h-11 w-11 rounded-xl bg-primary-soft grid place-items-center text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display font-semibold text-base">{r.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{r.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
