import { createFileRoute } from "@tanstack/react-router";
import AdminSignInPage from "@/pages/admin/signin/Page";
export const Route = createFileRoute("/admin/")({ component: AdminSignInPage });
