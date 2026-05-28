"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/auth-api";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(form);
      setAuth(data.accessToken, data.user);
      router.push("/dashboard");
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.response?.data?.message ?? err.message ?? "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-in relative z-10">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">DevBoard</span>
          </div>
          <p className="text-muted-foreground text-sm">Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div className="glass rounded-xl p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className={cn(
                  "w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5",
                  "text-sm text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                  "transition-all"
                )}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className={cn(
                  "w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5",
                  "text-sm text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                  "transition-all"
                )}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold",
                "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50",
                "transition-all flex items-center justify-center gap-2 mt-2",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}