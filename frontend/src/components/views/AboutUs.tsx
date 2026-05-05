import { useState } from "react";
import { supabase } from "../../lib/supabase";
import logo from "../../assets/logo.png";
import founder from "../../assets/founder.jpeg";

export default function AboutUs() {
  const [signingIn, setSigningIn] = useState(false);
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={logo}
            alt="Ghostwrites logo"
            className="h-16 w-16 object-contain"
          />
          <h1 className="text-4xl font-bold text-white">About Us</h1>
        </div>
        <p className="text-xl text-gray-400 mb-6">
          We build AI tools that help people get things done.
        </p>
        <p className="text-gray-300 leading-relaxed">
          Not demos. Not hype.
        </p>
        <p className="text-gray-300 leading-relaxed">
          Products that fit into real workflows and actually get used.
        </p>
      </div>

      {/* What We Believe */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">What We Believe</h2>
        <div className="bg-black/30 border border-white/10 rounded-lg p-6 mb-6">
          <p className="text-lg text-white italic mb-4">
            "AI shouldn't feel like a tool you operate. It should feel like a thinking partner you rely on."
          </p>
          <p className="text-gray-300">
            That idea shapes everything we build.
          </p>
        </div>
      </section>

      {/* The Product */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">The Product</h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          Our ghostwriting app helps founders, creators, and professionals show up online—consistently.
        </p>
        <p className="text-gray-300 leading-relaxed mb-6">
          It turns your ideas into content that:
        </p>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-black/30 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-medium">sounds like you</h4>
          </div>
          <div className="bg-black/30 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-medium">is clear and structured</h4>
          </div>
          <div className="bg-black/30 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-medium">is ready to publish</h4>
          </div>
        </div>
        <p className="text-gray-300 leading-relaxed">
          All without spending hours writing.
        </p>
      </section>

      {/* What We're Building */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">What We're Building</h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          We're building a system around how people think and create:
        </p>
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-black/30 border border-white/10 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-2">AI Content Assistant</h4>
            <p className="text-gray-400 text-sm">Social media, on autopilot</p>
          </div>
          <div className="bg-black/30 border border-white/10 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-2">AI Advisor</h4>
            <p className="text-gray-400 text-sm">Structured thinking for better decisions</p>
          </div>
          <div className="bg-black/30 border border-white/10 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-2">AI Voice Companion</h4>
            <p className="text-gray-400 text-sm">Natural conversations with AI</p>
          </div>
        </div>
        <p className="text-gray-300 leading-relaxed">
          Each product solves a real problem. No unnecessary complexity.
        </p>
      </section>

      {/* Founder Section */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
        <h2 className="text-2xl font-semibold text-white mb-6">Founder</h2>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 order-2 md:order-1">
            <p className="text-gray-300 leading-relaxed mb-4">
              Founded in April 2026 by Mohd Abbas.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Built by someone who:
            </p>
            <ul className="space-y-3 text-gray-300 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>has spent years experimenting with AI systems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>understands both product and distribution</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>has worked on B2B outreach, pre-sales, and collaborated with founders in the UK and US</span>
              </li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              This isn't just about building tools—it's about building things people actually use.
            </p>
          </div>
          <img
            src={founder}
            alt="Mohd Abbas - Founder"
            className="w-48 h-48 rounded-full object-cover border-2 border-white/30 flex-shrink-0 order-1 md:order-2 mr-24 mb-10"
          />
        </div>
      </section>

      {/* What Matters */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">What Matters</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-black/30 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-medium">Clarity over noise</h4>
          </div>
          <div className="bg-black/30 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-medium">Speed over perfection</h4>
          </div>
          <div className="bg-black/30 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-medium">Usefulness over hype</h4>
          </div>
        </div>
      </section>

      {/* What's Next */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">What's Next</h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          We're continuing to build tools that help people think better, create faster, and move forward.
        </p>
        <p className="text-gray-300 leading-relaxed">
          Open to collaborations, projects, and conversations with founders building in AI.
        </p>
      </section>

      {/* Final Line */}
      <section className="bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-semibold text-white mb-4">Final Line</h2>
        <p className="text-gray-300 leading-relaxed">
          If you have ideas worth sharing,
          we'd love to be part of that journey.
        </p>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-white/5 border border-white/10 rounded-xl p-8">
        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          className="inline-flex items-center justify-center gap-2 rounded-full font-medium h-11 px-6 text-sm bg-white text-black border border-white hover:bg-gray-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {signingIn ? (
            <span className="h-3.5 w-3.5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335" />
            </svg>
          )}
          <span>{signingIn ? "Signing in..." : "Get Started with Google"}</span>
        </button>
      </section>
    </div>
  );
}
