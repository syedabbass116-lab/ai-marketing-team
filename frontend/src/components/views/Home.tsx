import { Sparkles, ArrowRight, FolderOpen, Settings } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";

type HomeProps = {
  onStartGenerate: () => void;
  onOpenLibrary: () => void;
};

export default function Home({ onStartGenerate, onOpenLibrary }: HomeProps) {
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
        />
        <div className="relative max-w-2xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs tracking-widest uppercase">
            <Sparkles className="w-3 h-3" />
            Ghostwrite
          </div>
          <h1
            style={{ fontFamily: "var(--font-heading)" }}
            className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight"
          >
            Create high-performing<br />social content
          </h1>
          <p className="text-sm text-white/40 max-w-md mx-auto leading-relaxed">
            Generate posts and manage your content library — all in one place.
          </p>
          <div className="flex flex-wrap gap-3 pt-2 justify-center">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={onStartGenerate}
            >
              Generate your first post
            </Button>
            <Button variant="secondary" size="lg" onClick={onOpenLibrary}>
              Open Content Library
            </Button>
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
