import { UtensilsCrossed, Smile, Truck } from "lucide-react";
import { useTheme } from "@/utils/theme-context";

const SERVICES = [
  {
    icon: UtensilsCrossed,
    title: "Quality Food",
    desc: "Every dish is made fresh with real ingredients, cooked properly, every single time.",
  },
  {
    icon: Smile,
    title: "Super Taste",
    desc: "Authentic Nigerian flavor, the way it's meant to taste, straight from our kitchen to you.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Hot meals delivered quickly to your hostel, faculty, or pickup window on campus.",
  },
];

export function OurServices() {
  const { theme } = useTheme();

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Features
        </span>
        <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Our Awesome Services</h2>

        <div className="mt-12 grid sm:grid-cols-3 gap-10 sm:gap-6">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            const colorClass =
              theme === "dark"
                ? i % 2 === 0
                  ? "border-secondary text-secondary"
                  : "border-accent text-accent"
                : "border-primary text-primary";

            return (
              <div key={s.title} className="flex flex-col items-center">
                <div
                  className={`h-16 w-16 rounded-full border-2 grid place-items-center ${colorClass}`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className={`mt-4 font-display font-semibold ${colorClass.split(" ")[1]}`}>
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-55">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
