import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/utils/auth-context";
import { ROUTES } from "@/utils/routes";
import { toast } from "sonner";

export default function AdminSignInPage() {
  const { signInAdmin } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  const submit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await signInAdmin(form.email, form.password);
    if (!result.ok) {
      setErr(result.error);
      return;
    }
    toast.success("Welcome, admin");
    nav({ to: ROUTES.adminDashboard });
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary text-secondary-foreground">
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
      </header>

      <section className="flex-1 grid place-items-center px-4 py-10">
        <div className="w-full max-w-md bg-background text-foreground rounded-3xl p-8 shadow-glow space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">Staff Portal</h1>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Admin email</Label>
              <Input
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  setErr("");
                }}
                placeholder="admin@delsu.edu.ng"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  setErr("");
                }}
                placeholder="Enter admin password"
              />
              {err && <p className="text-xs text-destructive">{err}</p>}
            </div>
            <Button
              type="submit"
              className="w-full h-11 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              Sign in to dashboard
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
