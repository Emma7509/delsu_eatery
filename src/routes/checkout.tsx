import { createFileRoute } from "@tanstack/react-router";
import CheckoutPage from "@/pages/checkout/Page";
export const Route = createFileRoute("/checkout")({ component: CheckoutPage });
