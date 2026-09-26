import { Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/utils/cart-context";
import { isPopular, type MenuItem } from "@/utils/menu-context";
import { formatNaira } from "@/utils/format";
import { toast } from "sonner";

export function MenuItemCard({ item, onView }: { item: MenuItem; onView: (i: MenuItem) => void }) {
  const { add } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    add(item, 1);
    setAdding(true);
    setTimeout(() => setAdding(false), 300);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <article
      onClick={() => onView(item)}
      className="group cursor-pointer bg-card shadow-lg flex flex-col"
    >
      <div className="relative flex justify-center items-center pt-6 pb-2 min-h-64">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-56 w-56 object-contain group-hover:scale-105 transition-transform duration-500"
          style={{ filter: "drop-shadow(-20px 0 10px rgba(0,0,0,0.35))" }}
        />
        <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold">
          {item.rating}
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
        </div>
        {isPopular(item) && (
          <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wide text-secondary">
            Popular
          </span>
        )}
      </div>

      <div className="px-5 pb-5 flex flex-col items-center text-center flex-1">
        <div className="space-y-2">
          <h3 className="font-display font-semibold text-base leading-tight">{item.name}</h3>
          <span className="block text-sm font-bold text-primary">{formatNaira(item.price)}</span>
          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleAdd}
          className={`mt-6 rounded-xs border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors ${
            adding ? "bg-primary text-primary-foreground scale-95" : ""
          }`}
        >
          Add to Cart
        </Button>
      </div>
    </article>
  );
}
