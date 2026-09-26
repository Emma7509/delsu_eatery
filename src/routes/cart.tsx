import { createFileRoute } from "@tanstack/react-router";
import CartPage from "@/pages/cart/Page";
export const Route = createFileRoute("/cart")({ component: CartPage });
