import { createFileRoute } from "@tanstack/react-router";
import HomePage from "@/pages/home/Page";

export const Route = createFileRoute("/")({
  component: HomePage,
});
