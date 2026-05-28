"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/auth-api";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { setAccessToken, setUser } = useAuthStore();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await registerUser({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      setAccessToken(data.accessToken);
      setUser(data.user);
      router.push("/dashboard");
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err.response?.data?.message ?? "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-in relative z-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">DevBoard</span>
          </div>
          <p className="text-muted-foreground text-sm">Create your account</p>
        </div>

        <div className="glass rounded-xl p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                First Name
              </label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="Swapnil"
                className={cn(
                  "w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5",
                  "text-sm text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                )}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Last Name
              </label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Jadhav"
                className={cn(
                  "w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5",
                  "text-sm text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                )}
              />
            </div>
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
                  "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
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
                  "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
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
              Create account
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}