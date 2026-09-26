import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Clock, MapPin, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/routes";
import { useTheme } from "@/utils/theme-context";
import { useMenu } from "@/utils/menu-context";
import heroLight from "@/assets/hero-1.jpg";
import heroDark from "@/assets/hero-2.jpg";

export function Hero() {
  const { items } = useMenu();

  return (
    <section className="relative -mt-16 overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroLight} alt="" className="h-full w-full object-cover dark:hidden" />
        <img src={heroDark} alt="" className="h-full w-full object-cover hidden dark:block" />

        {/* Dark scrim, theme-independent — darkens both images consistently */}
        <div className="absolute inset-0 bg-black/45 dark:bg-black/40" />

        {/* Optional: extra radial darkening toward center-bottom where text sits */}
        {/* <div className="absolute inset-0 bg-radial from-black/20 via-transparent to-transparent" /> */}

        {/* Fade to background at the bottom so it blends into the next section */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />
      </div>

      {/* rest unchanged */}

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-32 pb-16 sm:pt-40 sm:pb-24 text-center flex flex-col items-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/70 backdrop-blur border border-border text-xs font-medium">
          DELSU Campus Eatery · Abraka
        </span>

        <h1 className="mt-6 text-3xl sm:text-5xl lg:text-6xl text-white font-display font-black leading-[1.1] tracking-tight">
          Campus meals, <span className="text-secondary">cooked with care.</span>
        </h1>
        <p className="italic font-light text-accent text-3xl sm:text-5xl lg:text-6xl font-display leading-[1.1] tracking-tight mt-2">
          You crave it, We cook it.
        </p>

        <p className="mt-5 text-base sm:text-lg text-white/60 max-w-xl">
          Order now and we'll bring it straight to your hostel, faculty, or pickup window.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <Link to={ROUTES.menu}>
            <Button
              size="lg"
              className="rounded-full h-12 px-6 bg-primary text-primary-foreground shadow-glow w-full sm:w-auto"
            >
              Order Now
            </Button>
          </Link>
          <Link to={ROUTES.menu} hash="menu">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full h-12 px-6 w-full sm:w-auto bg-background/70 backdrop-blur"
            >
              See Menu
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
          <Stat icon={<Clock className="h-4 w-4" />} value="15min" label="Avg delivery" />
          <Stat icon={<MapPin className="h-4 w-4" />} value="All hostels" label="Coverage" />
          <Stat
            icon={<UtensilsCrossed className="h-4 w-4" />}
            value="20+"
            label="Dishes to choose"
          />
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="space-y-1 flex flex-col items-center">
      <div className="flex items-center gap-1.5 text-accent">
        {icon}
        <span className="text-base sm:text-lg lg:text-xl font-bold text-foreground">{value}</span>
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
