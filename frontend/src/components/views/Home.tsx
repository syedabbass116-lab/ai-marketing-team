import { useState } from "react";
import { Sparkles, ArrowRight, FolderOpen, Check } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { useAuth } from "../../context/AuthContext";

type HomeProps = {
  onStartGenerate: () => void;
  onOpenLibrary: () => void;
};

export default function GhostwriteHero() {
  const handleGeneratePost = () => {
    // Navigate to generate content page
    window.location.href = '/generate';
  };

  const handleOpenLibrary = () => {
    // Navigate to content library page
    window.location.href = '/library';
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center px-4">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px]" />

      
      {/* Card */}
      <div className="relative max-w-xl w-full rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-8 text-center shadow-[0_0_80px_rgba(99,102,241,0.15)]">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1 mb-6 rounded-full border border-white/10 bg-white/5 text-sm text-white/70">
          ✦ GHOSTWRITE
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
          Hii Abbas what <br />
          would you like to post <br />
          today?
        </h1>

        {/* Subtext */}
        <p className="text-white/50 text-base mb-8">
          Generate posts and manage your content library — all in one place.
        </p>

        {/* Primary Button */}
        <button 
          onClick={handleGeneratePost}
          className="w-full mb-4 py-4 rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2 hover:bg-white/90 transition"
        >
          → Generate your first post
        </button>

        {/* Secondary Button */}
        <button 
          onClick={handleOpenLibrary}
          className="w-full py-4 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 transition"
        >
          Open Content Library
        </button>
      </div>
    </div>
  );
}
