import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import MenuPage from "@/pages/menu/Page";

export const Route = createFileRoute("/menu")({
  validateSearch: z.object({ category: z.string().optional() }),
  component: () => {
    const { category } = Route.useSearch();
    return <MenuPage initialCategory={category} />;
  },
});
