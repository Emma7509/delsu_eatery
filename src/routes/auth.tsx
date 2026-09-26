import { createFileRoute } from "@tanstack/react-router";
import AuthPage from "@/pages/auth/Page";
export const Route = createFileRoute("/auth")({ component: AuthPage });
