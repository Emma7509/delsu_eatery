import { useEffect, useState } from "react";
import { UtensilsCrossed } from "lucide-react";

export function WelcomeSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-primary flex items-center justify-center px-4">
      <div
        className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 font-bold font-['Bitcount_Grid_Double'] text-center transition-opacity ease-out"
        style={{ opacity: visible ? 1 : 0, transitionDuration: "5000ms" }}
      >
        {/* <UtensilsCrossed
          className="h-12 w-12 sm:h-20 sm:w-20 lg:h-27.5 lg:w-27.5 xl:h-35 xl:w-35 shrink-0 text-primary-foreground drop-shadow-2xl"
          strokeWidth={1.75}
          style={{ transform: "translateY(-14px)" }}
        /> */}
        <span
          className="tracking-tight leading-none text-[40px] sm:text-[64px] lg:text-[90px] xl:text-[180px] text-primary-foreground"
          style={{ letterSpacing: "-0.02em", wordSpacing: "-0.3em" }}
        >
          WELCOME TO DELSU EATERY, DELSUITE.
        </span>
      </div>
    </div>
  );
}
