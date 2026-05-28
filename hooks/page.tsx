"use client";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useAuthStore } from "@/store/auth";

export default function DashboardPage() {
  const ready = useAuthGuard();
  const user = useAuthStore((s) => s.user);

  if (!ready) return null;

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-in">
        <h1 className="text-2xl font-semibold mb-2">
          Welcome, {user?.name} 👋
        </h1>
        <p className="text-muted-foreground text-sm">Dashboard coming tomorrow — Day 2</p>
      </div>
    </main>
  );
}