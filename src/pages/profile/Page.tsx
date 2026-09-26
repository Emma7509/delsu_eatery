import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/utils/auth-context";
import { ROUTES } from "@/utils/routes";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, isGuest, updateUser, signOut } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    if (isGuest) nav({ to: ROUTES.auth });
    else if (user) setForm({ name: user.name, phone: user.phone, address: user.address });
  }, [isGuest, user, nav]);

  if (isGuest) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser(form);
    toast.success("Profile updated");
  };

  return (
    <PageLayout>
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground shadow-soft">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold">{user.name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <form onSubmit={save} className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold">Account details</h2>
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone number</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Default delivery address</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Hostel B, Room 204"
                rows={3}
              />
            </div>
            <Button
              type="submit"
              className="rounded-full bg-gradient-primary text-primary-foreground"
            >
              Save changes
            </Button>
          </form>

          <div className="mt-6 bg-card border border-border rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Sign out</h2>
              <p className="text-sm text-muted-foreground">End your session on this device.</p>
            </div>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                signOut();
                nav({ to: ROUTES.home });
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
