import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/utils/auth-context";
import { ROUTES } from "@/utils/routes";
import { toast } from "sonner";
import image from "@/assets/image.jpg";
import image1 from "@/assets/image-1.jpg";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn, signUp } = useAuth();
  const nav = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (mode === "signup" && !/^[0-9]{10,14}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Enter a valid phone";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const result =
      mode === "signin"
        ? await signIn(form.email, form.password)
        : await signUp({
            name: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password,
          });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(mode === "signin" ? "Welcome back!" : "Account created!");
    nav({ to: ROUTES.home });
  };

  return (
    <PageLayout>
      <section className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
        <div className="hidden lg:block relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.72_0.13_230/0.3),transparent_60%)]" />
          <div className="relative h-full overflow-hidden">
            <img
              src={image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover dark:hidden"
            />
            <img
              src={image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover hidden dark:block"
            />

            {/* Dark overlay for text legibility */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Centered text content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center px-8">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                DELSU Eatery
              </span>
              <h2 className="mt-4 text-4xl font-display font-bold leading-tight max-w-md text-white">
                Your favourite campus meals, one order away.
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-6">
            <div className="flex bg-muted rounded-full p-1">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setErrors({});
                  }}
                  className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
                    mode === m ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {m === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <div>
              <h1 className="text-3xl font-display font-bold">
                {mode === "signin" ? "Welcome back" : "Join DELSU Eatery"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === "signin"
                  ? "Sign in to place your order."
                  : "Create an account in seconds."}
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <Field label="Full name" error={errors.name}>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Tega Okoro"
                  />
                </Field>
              )}
              <Field label="Email" error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@student.delsu.edu.ng"
                />
              </Field>
              {mode === "signup" && (
                <Field label="Phone" error={errors.phone}>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="08012345678"
                  />
                </Field>
              )}
              <Field label="Password" error={errors.password}>
                <div className="relative">
                  <Input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <Button
                type="submit"
                className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-glow"
              >
                {mode === "signin" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setErrors({});
                }}
                className="text-secondary font-semibold hover:underline"
              >
                {mode === "signin" ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
