import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Mic,
  Calendar,
  TrendingUp,
  Twitter,
  Github,
  Linkedin,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { GoogleButton } from "@/components/landing/GoogleButton";
import { DashboardMockup } from "@/components/landing/DashboardMockup";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ghostwrites — High-performing posts in your brand voice" },
      {
        name: "description",
        content:
          "AI that writes high-performing social posts in your own voice — so you stay consistent on every platform without the burnout.",
      },
      { property: "og:title", content: "Ghostwrites — Stay consistent on social, in your voice" },
      {
        property: "og:description",
        content: "AI-generated posts in your brand voice. Plan a week of content in minutes.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Mic,
    title: "Trained on your voice",
    desc: "Paste a few past posts and our AI captures your tone, vocabulary, and style — no more generic AI slop.",
  },
  {
    icon: TrendingUp,
    title: "Built to perform",
    desc: "Every post is optimized against patterns from millions of high-engagement posts on each platform.",
  },
  {
    icon: Calendar,
    title: "Always consistent",
    desc: "A full week of on-brand content, scheduled in minutes. Never stare at a blank screen again.",
  },
];

const STEPS = [
  { n: "01", title: "Train your voice", desc: "Drop in a few of your best posts. We learn how you write." },
  { n: "02", title: "Generate posts", desc: "Get a week of high-performing posts, drafted in your tone." },
  { n: "03", title: "Schedule & post", desc: "Approve, schedule, and stay consistent across every platform." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-2 lg:gap-8 lg:pt-28">
          <div className="flex flex-col items-start animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse-soft" />
              AI trained on your brand voice
            </div>
            <h1 className="font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Post like you.<br />Every single day.
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground sm:mt-6 sm:text-lg">
              AI that writes high-performing social posts in your own voice — so you stay consistent without the burnout.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:items-center">
              <GoogleButton size="lg" className="w-full sm:w-auto" />
              <a
                href="#preview"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-full px-7 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Explore Demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Free to start</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> No credit card</span>
            </div>
          </div>

          <div className="relative animate-fade-in lg:translate-y-4">
            <div className="absolute -inset-6 rounded-3xl bg-foreground/[0.03] blur-2xl" aria-hidden />
            <div className="relative animate-float">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Why Ghostwrites</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Sounds like you.<br />Performs like a pro.
          </h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:mt-16 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group bg-background p-6 transition-colors hover:bg-secondary/40 sm:p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background transition-transform group-hover:scale-105">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-5xl">
              From blank page to posted in minutes
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:mt-16 sm:gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-background p-6 shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 sm:p-8">
                <p className="font-display text-sm font-bold text-muted-foreground">{s.n}</p>
                <h3 className="mt-3 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW */}
      <section id="preview" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">The product</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Your content engine, on autopilot
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Draft, schedule, and track every post from one focused workspace.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-3xl sm:mt-14">
          <DashboardMockup />
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-foreground px-6 py-16 text-background sm:px-16 sm:py-20">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} aria-hidden />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
              Stay consistent.<br />Sound like yourself.
            </h2>
            <p className="mt-5 text-base text-background/70 sm:text-lg">
              Join creators and founders who post every day — without burning out.
            </p>
            <div className="mt-10 flex justify-center">
              <GoogleButton size="lg" variant="dark" className="w-full sm:w-auto" />
            </div>
            <p className="mt-4 text-xs text-background/50">Free to start. No credit card required.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 font-display text-base font-bold">
            <img src={logo} alt="Ghostwrites logo" className="h-14 w-14 object-contain" />
            Ghostwrites
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
            <a href="#" className="transition-colors hover:text-foreground">Terms</a>
            <a href="#" className="transition-colors hover:text-foreground">Contact</a>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <a href="#" aria-label="Twitter" className="rounded-full p-2 transition-colors hover:bg-secondary hover:text-foreground"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="GitHub" className="rounded-full p-2 transition-colors hover:bg-secondary hover:text-foreground"><Github className="h-4 w-4" /></a>
            <a href="#" aria-label="LinkedIn" className="rounded-full p-2 transition-colors hover:bg-secondary hover:text-foreground"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>
        <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Ghostwrites. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
