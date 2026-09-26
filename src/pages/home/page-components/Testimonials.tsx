import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/utils/mock-data";

export function Testimonials() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Voices from campus
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold">
            Loved by DELSU students
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="bg-card rounded-3xl p-7 shadow-soft hover:shadow-glow transition-shadow"
            >
              <Quote className="h-8 w-8 text-primary mb-4" />
              <blockquote className="text-base leading-relaxed mb-6 text-foreground">
                "{t.quote}"
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-11 w-11 rounded-full object-cover border-2 border-primary"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
