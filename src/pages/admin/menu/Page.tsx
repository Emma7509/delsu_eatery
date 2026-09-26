import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Pencil, Trash2, Plus, Star } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { useAuth } from "@/utils/auth-context";
import { useMenu, CATEGORIES, type MenuItem } from "@/utils/menu-context";
import { formatNaira } from "@/utils/format";
import { ROUTES } from "@/utils/routes";
import { toast } from "sonner";
import { uploadImageToCloudinary } from "@/utils/cloudinary";

type FormState = Omit<MenuItem, "id"> & { id?: string };

const EMPTY: FormState = {
  name: "",
  category: "Local Dishes",
  price: 0,
  image: "",
  description: "",
  rating: 4.5,
};

export default function AdminMenuPage() {
  const { isAdmin, authReady } = useAuth();
  const nav = useNavigate();
  const { items, addItem, updateItem, deleteItem } = useMenu();
  const [editing, setEditing] = useState<FormState | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (authReady && !isAdmin) nav({ to: ROUTES.adminSignIn });
  }, [authReady, isAdmin, nav]);

  const save = async (item: FormState) => {
    if (!item.name.trim()) return toast.error("Name is required");
    if (item.price <= 0) return toast.error("Price must be greater than zero");
    if (!item.image.trim()) return toast.error("Image URL is required");
    if (item.id) {
      const { id, ...patch } = item;
      await updateItem(id, patch);
      toast.success("Menu item updated");
    } else {
      await addItem(item);
      toast.success("Menu item added");
    }
    setOpen(false);
    setEditing(null);
  };

  return (
    <AdminLayout>
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Admin
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-display font-bold">Menu Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Add, edit, or remove dishes. Changes appear instantly on the storefront.
              </p>
            </div>

            <Button
              onClick={() => {
                setEditing(EMPTY);
                setOpen(true);
              }}
              className="rounded-full bg-gradient-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add new item
            </Button>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                        No menu items yet. Click "Add new item" to begin.
                      </td>
                    </tr>
                  )}
                  {items.map((i) => (
                    <tr key={i.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={i.image}
                            alt={i.name}
                            className="h-10 w-10 rounded-lg object-cover shrink-0 bg-muted"
                          />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{i.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Star className="h-3 w-3 fill-accent text-accent" />
                              {i.rating}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{i.category}</td>
                      <td className="px-4 py-3 font-semibold">{formatNaira(i.price)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full"
                            onClick={() => {
                              setEditing(i);
                              setOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
                            onClick={() => setConfirmDelete(i)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogTitle className="font-display text-xl">
            {editing?.id ? "Edit item" : "Add new item"}
          </DialogTitle>
          {editing && <ItemForm initial={editing} onSave={save} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogTitle className="font-display text-lg">
            Delete "{confirmDelete?.name}"?
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            This will permanently remove it from the menu.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => setConfirmDelete(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (confirmDelete) {
                  await deleteItem(confirmDelete.id);
                  toast.success("Item deleted");
                }
                setConfirmDelete(null);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function ItemForm({ initial, onSave }: { initial: FormState; onSave: (i: FormState) => void }) {
  const [f, setF] = useState<FormState>(initial);
  const [uploading, setUploading] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(f);
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input
          value={f.name}
          onChange={(e) => setF({ ...f, name: e.target.value })}
          placeholder="e.g. Jollof Rice & Chicken"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <select
            value={f.category}
            onChange={(e) => setF({ ...f, category: e.target.value })}
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Price (₦)</Label>
          <Input
            type="number"
            min={0}
            value={f.price}
            onChange={(e) => setF({ ...f, price: Number(e.target.value) })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Dish photo</Label>
        <div className="flex items-start gap-3">
          <label className="flex-1 cursor-pointer border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-secondary/50 transition-colors bg-muted/30">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) {
                  toast.error("Image must be under 2MB");
                  return;
                }
                setUploading(true);
                try {
                  const url = await uploadImageToCloudinary(file);
                  setF({ ...f, image: url });
                } catch {
                  toast.error("Image upload failed. Try again.");
                } finally {
                  setUploading(false);
                }
              }}
            />
            <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {uploading
                ? "Uploading..."
                : f.image
                  ? "Change photo"
                  : "Click to upload from your device"}
            </span>
          </label>
          {f.image && (
            <img
              src={f.image}
              alt="preview"
              className="h-24 w-24 object-cover rounded-lg border border-border shrink-0"
            />
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          value={f.description}
          onChange={(e) => setF({ ...f, description: e.target.value })}
          rows={3}
          placeholder="Tell students what's in it..."
        />
      </div>

      <div className="space-y-1.5">
        <Label>Rating (0-5)</Label>
        <Input
          type="number"
          min={0}
          max={5}
          step={0.1}
          value={f.rating}
          onChange={(e) => setF({ ...f, rating: Number(e.target.value) })}
        />
      </div>
      <div className="flex items-center gap-3 pt-1"></div>

      <Button
        type="submit"
        className="w-full rounded-full bg-gradient-primary text-primary-foreground"
      >
        {f.id ? "Save changes" : "Add to menu"}
      </Button>
    </form>
  );
}
