"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Zap, Users, BarChart3, Shield, Bell, GitBranch, Sun, Moon } from "lucide-react";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border backdrop-blur-md bg-background/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">D</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">DevBoard</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="p-2 rounded-md border border-border hover:bg-muted transition-colors"
          >
            {mounted && theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <Link href="/login" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-primary text-primary-foreground font-semibold px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </nav>

      <main className="pt-20 px-4 max-w-5xl mx-auto pb-24">

        {/* Hero */}
        <section className="pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-primary font-medium">Real-time collaboration</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-4">
            Ship faster.<br />
            <span className="text-primary">Stay aligned.</span>
          </h1>
          <p className="text-foreground/50 text-base md:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
            DevBoard brings tasks, teams, and real-time updates into one clean workspace — built for developers, by a developer.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Start free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="https://devboards-api.onrender.com/api/docs"
              target="_blank"
              className="text-sm text-foreground/50 hover:text-foreground transition-colors px-4 py-2.5 border border-border rounded-lg hover:border-foreground/20"
            >
              API docs →
            </Link>
          </div>
        </section>

        {/* Bento Grid — Feature Blocks */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">

          {/* 2x2 — Main feature */}
          <div className="bento-card col-span-2 row-span-2 bg-card border border-border rounded-2xl p-6 flex flex-col justify-between min-h-[240px]">
            <div>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Task board with real-time sync</h2>
              <p className="text-sm text-foreground/40 leading-relaxed">
                Create, assign, and move tasks across statuses. Every update is broadcast live via WebSocket — no refresh needed.
              </p>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              {["todo", "in_progress", "done"].map((s) => (
                <span key={s} className="text-xs bg-muted border border-border rounded-full px-3 py-1 text-foreground/50">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* 1x1 */}
          <div className="bento-card col-span-1 bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">Team roles</h3>
              <p className="text-xs text-foreground/40">Owner, admin, member, viewer — with privilege escalation rules.</p>
            </div>
          </div>

          {/* 1x1 */}
          <div className="bento-card col-span-1 bg-primary/5 border border-primary/10 rounded-2xl p-5 flex flex-col gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">Email notifications</h3>
              <p className="text-xs text-foreground/40">Invite and assignment emails sent via background queue.</p>
            </div>
          </div>

          {/* 1x1 */}
          <div className="bento-card col-span-1 bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">Secure auth</h3>
              <p className="text-xs text-foreground/40">JWT + refresh rotation with reuse detection baked in.</p>
            </div>
          </div>

          {/* 1x1 */}
          <div className="bento-card col-span-1 bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">Activity log</h3>
              <p className="text-xs text-foreground/40">Immutable audit trail for every org event.</p>
            </div>
          </div>

        </section>

        {/* Second bento row */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">

          {/* Wide stat block */}
          <div className="bento-card col-span-2 md:col-span-1 bg-card border border-border rounded-2xl p-6">
            <p className="text-xs text-foreground/40 uppercase tracking-widest mb-3 font-medium">Stack</p>
            <div className="flex flex-wrap gap-2">
              {["NestJS", "PostgreSQL", "TypeORM", "Redis", "BullMQ", "Next.js 14", "WebSocket"].map((t) => (
                <span key={t} className="text-xs bg-muted border border-border rounded-md px-2.5 py-1 text-foreground/60 font-mono">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Metric block */}
          <div className="bento-card col-span-1 bg-secondary/5 border border-secondary/10 rounded-2xl p-6 flex flex-col justify-between">
            <p className="text-xs text-foreground/40 uppercase tracking-widest font-medium">Rate limiting</p>
            <div>
              <p className="text-3xl font-bold text-secondary">100</p>
              <p className="text-xs text-foreground/40 mt-1">requests / minute global</p>
            </div>
          </div>

          {/* Metric block */}
          <div className="bento-card col-span-1 bg-card border border-border rounded-2xl p-6 flex flex-col justify-between">
            <p className="text-xs text-foreground/40 uppercase tracking-widest font-medium">Token TTL</p>
            <div>
              <p className="text-3xl font-bold text-primary">15m</p>
              <p className="text-xs text-foreground/40 mt-1">access · 7d refresh</p>
            </div>
          </div>

        </section>

        {/* Third row — social proof + CTA */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {/* Checklist block */}
          <div className="bento-card bg-card border border-border rounded-2xl p-6">
            <p className="text-xs text-foreground/40 uppercase tracking-widest mb-4 font-medium">What's inside</p>
            <ul className="space-y-2.5">
              {[
                "Organizations with scoped projects",
                "Invite members by email with role control",
                "Task filtering, pagination, soft delete",
                "Swagger docs live in production",
                "CI/CD on every push to main",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground/60">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA block */}
          <div className="bento-card bg-primary/5 border border-primary/10 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs text-primary/60 uppercase tracking-widest mb-3 font-medium">Open to work</p>
              <h3 className="text-lg font-semibold mb-2">Built by Swapnil Jadhav</h3>
              <p className="text-sm text-foreground/40 leading-relaxed">
                Final semester B.Tech CSE, NKOCET Solapur. Interned at Apprely Technologies building NestJS + Next.js systems for Solapur Municipal Corporation.
              </p>
            </div>
            <div className="flex gap-2 mt-6">
              <Link
                href="/register"
                className="flex-1 text-center text-sm bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Try DevBoard
              </Link>
              <Link
                href="https://devboards-api.onrender.com/api/docs"
                target="_blank"
                className="flex-1 text-center text-sm border border-border text-foreground/60 py-2.5 rounded-lg hover:border-foreground/20 hover:text-foreground transition-colors"
              >
                View API docs
              </Link>
            </div>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center">
        <p className="text-xs text-foreground/30">
          DevBoard · Built with NestJS, Next.js 14, PostgreSQL · Deployed on Render
        </p>
      </footer>
    </div>
  );
}