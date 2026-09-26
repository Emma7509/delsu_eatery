import { createFileRoute } from "@tanstack/react-router";
import AdminOrdersPage from "@/pages/admin/orders/Page";
export const Route = createFileRoute("/admin/orders")({ component: AdminOrdersPage });
