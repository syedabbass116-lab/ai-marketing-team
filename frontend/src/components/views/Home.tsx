import { useState } from "react";
import { Sparkles, ArrowRight, FolderOpen, Check } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { useAuth } from "../../context/AuthContext";

type HomeProps = {
  onStartGenerate: () => void;
  onOpenLibrary: () => void;
};

export default function Home({ onStartGenerate, onOpenLibrary }: HomeProps) {
  const { user } = useAuth();
  const fullName = user?.user_metadata?.full_name || "";
  const firstName = fullName ? fullName.split(' ')[0] : (user?.email?.split('@')[0] || "there");
  const username = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const [signingIn, setSigningIn] = useState(false);
  
  const handleGoogleSignIn = () => {
    setSigningIn(true);
    setTimeout(() => {
      setSigningIn(false);
      onStartGenerate();
    }, 1000);
  };

  const onSignIn = () => {
    onStartGenerate();
  };

  return (
    <div className="space-y-8">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a] px-8 py-12 text-center">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,255,255,0.06), transparent)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-2 lg:gap-8 lg:pt-28">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs tracking-widest uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              AI trained on your brand voice
            </div>
            <h1
              style={{ fontFamily: "var(--font-heading)" }}
              className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight"
            >
              Hii {username} what would<br />you like to post today?
            </h1>
            <p className="text-sm text-white/40 max-w-md mx-auto leading-relaxed">
              Generate posts and manage your content library — all in one place.
            </p>
            <div className="flex flex-wrap gap-3 pt-2 justify-center sm:w-auto sm:flex-row sm:items-center justify-center lg:justify-start">
              <button
                id="hero-google-signin"
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="inline-flex items-center justify-center gap-2 rounded-full font-medium h-9 px-4 text-xs bg-white text-black border border-white hover:bg-gray-100 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {signingIn ? (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
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
        </div>
      </div>

      {/* Quick-access cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card hover>
          <div className="space-y-3" onClick={onStartGenerate}>
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white/60" />
            </div>
            <h3
              style={{ fontFamily: "var(--font-heading)" }}
              className="text-sm font-bold text-white tracking-tight"
            >
              Generate Content
            </h3>
            <p className="text-xs text-white/40 leading-relaxed">
              AI-powered posts written in your brand voice, ready to publish.
            </p>
          </div>
        </Card>

        <Card hover>
          <div className="space-y-3" onClick={onOpenLibrary}>
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-white/60" />
            </div>
            <h3
              style={{ fontFamily: "var(--font-heading)" }}
              className="text-sm font-bold text-white tracking-tight"
            >
              Content Library
            </h3>
            <p className="text-xs text-white/40 leading-relaxed">
              Save and reuse your best-performing post ideas across platforms.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
