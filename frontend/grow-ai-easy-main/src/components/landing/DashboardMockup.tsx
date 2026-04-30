import { Heart, MessageCircle, Repeat2, Sparkles, Calendar, TrendingUp } from "lucide-react";

export function DashboardMockup() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-[oklch(0.08_0_0)] p-4 shadow-[var(--shadow-glow)] sm:p-5">
      {/* Window chrome */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>
        <div className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/50">
          app.ghostwrites.io
        </div>
        <div className="h-2 w-10" />
      </div>

      <div className="grid gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-white/40">This week</p>
            <h3 className="font-display text-sm font-semibold text-white">Your content calendar</h3>
          </div>
          <div className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-black">
            + Generate post
          </div>
        </div>

        {/* AI generated post card */}
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-black">
              <Sparkles className="h-3 w-3" />
            </div>
            <p className="text-[10px] font-medium text-white/60">Drafted in your voice · 2s ago</p>
            <span className="ml-auto rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-medium text-emerald-400">
              94% on-brand
            </span>
          </div>
          <p className="text-[12px] leading-relaxed text-white/85">
            Stop guessing what to post. The best creators don't wait for inspiration — they build a system. Here's the 3-step framework I use every Sunday to plan a full week of content in 20 minutes 👇
          </p>
          <div className="mt-3 flex items-center gap-4 text-[10px] text-white/40">
            <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" /> 1.2k</span>
            <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" /> 84</span>
            <span className="inline-flex items-center gap-1"><Repeat2 className="h-3 w-3" /> 312</span>
            <span className="ml-auto text-white/50">Predicted reach: <span className="text-white">38.4k</span></span>
          </div>
        </div>

        {/* Schedule strip */}
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/60">
              <Calendar className="h-3 w-3" /> Scheduled
            </p>
            <p className="inline-flex items-center gap-1 text-[10px] text-emerald-400/90">
              <TrendingUp className="h-3 w-3" /> +42% engagement
            </p>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-white/40">{d}</span>
                <div className="flex h-12 w-full flex-col gap-0.5 rounded-md bg-white/[0.04] p-1">
                  {[0, 1, 2].map((j) => (
                    <div
                      key={j}
                      className="flex-1 rounded-sm bg-white"
                      style={{ opacity: i < 5 && j < (i % 3) + 1 ? 0.7 : 0.08 }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
