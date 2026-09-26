import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/routes";
import aboutPrimary from "@/assets/image-1.jpg";
import aboutSecondary from "@/assets/image-2.jpg";
import aboutThird from "@/assets/image.jpg";

export function AboutUs() {
  return (
    <section className="py-16 sm:py-20 bg-primary-soft/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div className="md:mb-20 relative scale-90 h-64 sm:h-72 flex items-center justify-center md:scale-110">
          <div className="absolute h-52 w-52 sm:h-64 sm:w-64 rounded-2xl overflow-hidden shadow-2xl origin-bottom rotate-18">
            <img src={aboutThird} alt="DELSU Eatery" className="h-full w-full object-cover" />
          </div>
          <div className="absolute h-52 w-52 sm:h-64 sm:w-64 rounded-2xl overflow-hidden shadow-2xl origin-bottom -rotate-2">
            <img src={aboutSecondary} alt="DELSU Eatery" className="h-full w-full object-cover" />
          </div>
          <div className="absolute h-52 w-52 sm:h-64 sm:w-64 rounded-2xl overflow-hidden shadow-2xl origin-bottom -rotate-22">
            <img src={aboutPrimary} alt="DELSU Eatery" className="h-full w-full object-cover" />
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            About Us
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-display font-bold leading-tight">
            We pride ourselves on serving real food, made properly, every day.
          </h2>
          <p className="text-base mt-4 text-muted-foreground max-w-md">
            DELSU Eatery is the official campus eatery serving Delta State University, Abraka. We
            prepare every meal fresh, price it fairly for students, and deliver it straight to your
            hostel or faculty, wherever you are on campus.
          </p>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground max-w-md">
            <MapPin className="h-4 w-4 text-secondary shrink-0" />
            Delta State University, Campus 3, Abraka, Delta State. Beside the library.
          </p>

          <Link to={ROUTES.menu}>
            <Button className="mt-6 rounded-full h-11 px-6 bg-gradient-primary text-primary-foreground shadow-glow">
              Order Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
