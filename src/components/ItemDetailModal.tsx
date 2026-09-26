import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Star, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/utils/cart-context";
import { isPopular, type MenuItem } from "@/utils/menu-context";
import { formatNaira } from "@/utils/format";
import { toast } from "sonner";

export function ItemDetailModal({
  item,
  open,
  onClose,
}: {
  item: MenuItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (open) setQty(1);
  }, [open, item?.id]);

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">{item.name}</DialogTitle>
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square md:aspect-auto bg-muted">
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            {isPopular(item) && (
              <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground border-0">
                Popular
              </Badge>
            )}
          </div>
          <div className="p-6 sm:p-8 flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">
              {item.category}
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold leading-tight">
              {item.name}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-semibold">{item.rating}</span>
                <span className="text-muted-foreground">/ 5</span>
              </div>
              <span className="text-2xl font-bold text-secondary">{formatNaira(item.price)}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>

            <div className="mt-auto space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold">{qty}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setQty((q) => q + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => {
                  add(item, qty);
                  toast.success(`Added ${qty} × ${item.name}`);
                  onClose();
                }}
                className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-glow text-base"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add {qty} to cart · {formatNaira(item.price * qty)}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
