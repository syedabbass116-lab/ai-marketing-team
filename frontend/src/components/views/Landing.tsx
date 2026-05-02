import {
  Mic,
  Calendar,
  TrendingUp,
  Twitter,
  Linkedin,
  Check,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
        fill="#EA4335"
      />
    </svg>
  );
}

const FEATURES = [
  {
    icon: Mic,
    title: "Trained on your voice",
    desc: "Paste a few past posts and our AI captures your tone, vocabulary, and style.",
  },
  {
    icon: TrendingUp,
    title: "Built to perform",
    desc: "Every post is optimized against patterns from high-engagement posts.",
  },
  {
    icon: Calendar,
    title: "Always consistent",
    desc: "A full week of on-brand content, scheduled in minutes.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Train your voice",
    desc: "Drop in a few of your best posts. We learn how you write.",
  },
  {
    n: "02",
    title: "Generate posts",
    desc: "Get a week of high-performing posts, drafted in your tone.",
  },
  {
    n: "03",
    title: "Schedule & post",
    desc: "Approve, schedule, and stay consistent across every platform.",
  },
];

export default function Landing({ onSignIn }: { onSignIn: () => void }) {
  const { user } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  if (user) {
    return null; // Will be handled by App.tsx routing
  }

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
    } catch (err) {
      console.error("Google sign-in error:", err);
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Ghostwrite logo"
              className="h-20 w-20 object-contain ml-2"
            />
            <span className="font-mono text-lg font-bold tracking-tight text-white sm:text-xl">
              Ghostwrite
            </span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
            <a href="#features" className="transition-colors hover:text-white">
              Features
            </a>
            <a href="#how" className="transition-colors hover:text-white">
              How it works
            </a>
            <a href="#preview" className="transition-colors hover:text-white">
              Product
            </a>
          </div>
          <button
            id="navbar-google-signin"
            onClick={onSignIn}
            className="inline-flex items-center justify-center gap-2 rounded-full font-medium h-9 px-4 text-xs bg-white text-black border border-white hover:bg-gray-100 transition-all duration-300"
          >
            Sign in
          </button>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-2 lg:gap-8 lg:pt-28">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              AI trained on your brand voice
            </div>
            <h1 className="font-mono text-[2.5rem] font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Post like you.
              <br />
              Every single day.
            </h1>
            <p className="mt-5 max-w-lg text-base text-gray-400 sm:mt-6 sm:text-lg">
              AI that writes high-performing social posts in your own voice — so
              you stay consistent without the burnout.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:items-center justify-center lg:justify-start">
              <button
                id="hero-google-signin"
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="inline-flex items-center justify-center gap-2.5 rounded-full font-medium h-11 px-5 text-sm bg-white text-black border border-white hover:bg-gray-100 transition-all mx-auto lg:mx-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {signingIn ? (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                ) : (
                  <GoogleIcon className="h-4 w-4" />
                )}
                <span>{signingIn ? "..." : "Get Started with Google"}</span>
              </button>
              <button
                onClick={onSignIn}
                className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10 sm:w-auto sm:px-4 sm:py-2.5 sm:text-sm"
              >
                Sign up with Email
              </button>
            </div>
            <div className="mt-4 text-sm text-gray-400 text-center lg:text-left">
              Already have an account?{" "}
              <button
                onClick={onSignIn}
                className="font-medium text-white underline decoration-white/20 hover:decoration-white"
              >
                Sign in with Email
              </button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" /> Free to start
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" /> No credit card
              </span>
            </div>
          </div>

          <div className="relative lg:translate-y-4">
            <div
              className="absolute -inset-6 rounded-3xl bg-white/[0.03] blur-2xl"
              aria-hidden
            />
            <div className="relative rounded-2xl border border-white/10 bg-[rgba(15,15,15,0.8)] p-4 shadow-2xl">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-xs text-white/60 mb-2">
                    Your AI-Generated Post
                  </p>
                  <p className="text-sm text-white/85">
                    Stop guessing what to post. The best creators build a
                    system...
                  </p>
                  <div className="mt-2 flex gap-4 text-xs text-white/40">
                    <span>1.2k likes</span>
                    <span>84 comments</span>
                    <span className="ml-auto">94% on-brand</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            Why Ghostwrite
          </p>
          <h2 className="mt-3 font-mono text-3xl font-bold tracking-tight sm:text-5xl">
            Sounds like you.
            <br />
            Performs like a pro.
          </h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:mt-16 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group bg-black p-6 transition-colors hover:bg-white/5 sm:p-8 border-r border-white/10 last:border-r-0"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black transition-transform group-hover:scale-105">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 font-mono text-xl font-semibold">
                {f.title}
              </h3>
              <p className="mt-2 text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
              How it works
            </p>
            <h2 className="mt-3 font-mono text-3xl font-bold tracking-tight sm:text-5xl">
              From blank page to posted in minutes
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:mt-16 sm:gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-white/10 bg-black p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 sm:p-8"
              >
                <p className="font-mono text-sm font-bold text-gray-500">
                  {s.n}
                </p>
                <h3 className="mt-3 font-mono text-xl font-semibold">
                  {s.title}
                </h3>
                <p className="mt-2 text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW */}
      <section
        id="preview"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            The product
          </p>
          <h2 className="mt-3 font-mono text-3xl font-bold tracking-tight sm:text-5xl">
            Your content engine, on autopilot
          </h2>
          <p className="mt-4 text-base text-gray-400 sm:text-lg">
            Draft, schedule, and track every post from one focused workspace.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white px-6 py-16 text-black sm:px-16 sm:py-20">
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-3xl font-bold tracking-tight sm:text-5xl">
              Stay consistent.
              <br />
              Sound like yourself.
            </h2>
            <p className="mt-5 text-base text-black/70 sm:text-lg">
              Join creators and founders who post every day — without burning
              out.
            </p>
            <div className="mt-10 flex justify-center">
              <button
                id="cta-google-signin"
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="inline-flex items-center justify-center gap-2.5 rounded-full font-medium h-11 px-6 text-sm bg-black text-white border border-black hover:bg-gray-900 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {signingIn ? (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : (
                  <GoogleIcon className="h-4 w-4" />
                )}
                <span>{signingIn ? "..." : "Get Started"}</span>
              </button>
            </div>
            <p className="mt-4 text-xs text-black/50">
              Free to start. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 font-mono text-base font-bold">
            <img
              src={logo}
              alt="Ghostwrite logo"
              className="h-8 w-8 object-contain"
            />
            <span>Ghostwrite</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="transition-colors hover:text-white">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Contact
            </a>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <a
              href="#"
              aria-label="Twitter"
              className="rounded-full p-2 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="rounded-full p-2 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="border-t border-white/10 py-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Ghostwrites. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
