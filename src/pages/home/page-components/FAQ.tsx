import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "How do I pay for my order?",
    a: "Payment is handled securely through Paystack. You can pay with a card, bank transfer, or USSD, right at checkout.",
  },
  {
    q: "Where do you deliver to?",
    a: "We deliver to every hostel and faculty building on campus. You can also choose pickup if you'd rather grab your order yourself.",
  },
  {
    q: "How long does delivery take?",
    a: "Most orders reach you within 15 to 25 minutes, depending on how busy the kitchen is at the time.",
  },
  {
    q: "Can I track my order after paying?",
    a: "Yes. Once your payment is confirmed, you're taken straight to a tracking page that updates automatically as your order moves from Received to Preparing to Delivered.",
  },
  {
    q: "Do I need an account to order?",
    a: "Yes, a quick sign up is required so we can confirm your order and keep you updated on its status.",
  },
  {
    q: "What if something's wrong with my order?",
    a: "Reach out to us through the contact details in the footer and we'll sort it out as quickly as we can.",
  },
];

export function FAQ() {
  return (
    <section className="py-16 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">FAQ</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-display font-bold">
            Frequently asked questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-display font-semibold text-base hover:no-underline hover:text-primary">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
