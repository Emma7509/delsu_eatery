import { createFileRoute } from "@tanstack/react-router";
import AdminMenuPage from "@/pages/admin/menu/Page";
export const Route = createFileRoute("/admin/menu")({ component: AdminMenuPage });
