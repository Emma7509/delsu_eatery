import { createFileRoute } from "@tanstack/react-router";
import OrdersPage from "@/pages/orders/Page";
export const Route = createFileRoute("/orders")({ component: OrdersPage });
