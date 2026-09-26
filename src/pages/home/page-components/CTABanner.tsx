import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/utils/routes";
import ctaImage from "@/assets/CTAimage.png";

const CTA_IMAGE = ctaImage;

export function CTABanner() {
  return (
    <section className="pb-20 pt-10">
      <div className="relative w-full py-14 sm:py-20">
        <div className="absolute inset-x-3 sm:inset-x-6 lg:inset-x-10 top-0 bottom-0 rounded-3xl overflow-hidden">
          <img src={CTA_IMAGE} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white"
            style={{ textShadow: "0 3px 16px rgba(0,0,0,0.55)" }}
          >
            Skip the queue.
            <br />
            Order ahead.
          </h2>
          <p className="mt-4 text-white/90" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.55)" }}>
            Fresh meals, delivered fast to every hostel and faculty on campus.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 rounded-full md:bg-card md:border md:border-border shadow-soft p-2 max-w-md mx-auto">
            <Link to={ROUTES.auth} className="w-full sm:flex-1">
              <Button className="md:w-full rounded-full h-12 bg-gradient-primary text-primary-foreground">
                Create account
              </Button>
            </Link>
            <Link to={ROUTES.menu} className="w-full sm:flex-1">
              <Button variant="ghost" className="md:w-full rounded-full h-12">
                Browse menu
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
