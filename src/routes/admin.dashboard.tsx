import { createFileRoute } from "@tanstack/react-router";
import AdminDashboardPage from "@/pages/admin/dashboard/Page";
export const Route = createFileRoute("/admin/dashboard")({ component: AdminDashboardPage });
