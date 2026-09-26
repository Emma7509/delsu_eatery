import { Link } from "@tanstack/react-router";
import { UtensilsCrossed } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const txt =
    size === "xl"
      ? "text-3xl sm:text-5xl lg:text-6xl xl:text-7xl"
      : size === "lg"
        ? "text-lg sm:text-2xl"
        : size === "sm"
          ? "text-sm sm:text-base"
          : "text-xs sm:text-xl";
  const ico =
    size === "xl"
      ? "h-10 w-10 sm:h-16 sm:w-16 lg:h-20 lg:w-20"
      : size === "lg"
        ? "h-7 w-7 sm:h-9 sm:w-9"
        : size === "sm"
          ? "h-6 w-6 sm:h-7 sm:w-7"
          : "h-7 w-7 sm:h-8 sm:w-8";
  const sub = size === "xl" ? "text-[10px] sm:text-xs sm:text-sm" : "text-[9px] sm:text-[10px]";

  return (
    <Link to="/" className="flex items-center gap-1.5 sm:gap-2 md:gap-3 group">
      <div
        className={`${ico} shrink-0 grid place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft group-hover:scale-105 transition-transform`}
      >
        <UtensilsCrossed className="h-1/2 w-1/2" strokeWidth={2.5} />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`${txt} font-display font-bold tracking-tight`}>DELSU Eatery</span>
        <span className={`${sub} uppercase tracking-[0.18em] text-accent mt-1`}>Food Faculty</span>
      </div>
    </Link>
  );
}
