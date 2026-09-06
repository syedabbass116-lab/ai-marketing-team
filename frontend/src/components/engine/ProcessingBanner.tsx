import { Loader2, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import { EngineJob } from '../../types/engine';

interface ProcessingBannerProps {
  job: EngineJob | null;
  onDismiss: () => void;
}

export default function ProcessingBanner({ job, onDismiss }: ProcessingBannerProps) {
  if (!job) return null;

  const isComplete = job.status === 'ready';
  const isFailed = job.status === 'failed';

  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden animate-fadeIn">
      {/* Dynamic Background Glow */}
      <div
        className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-[80px] pointer-events-none transition-all duration-700 ${
          isComplete
            ? 'bg-emerald-500/20'
            : isFailed
            ? 'bg-rose-500/20'
            : 'bg-indigo-500/20'
        }`}
      />

      <div className="flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isComplete
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : isFailed
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse'
            }`}
          >
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isFailed ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                {isComplete
                  ? 'Processing Complete'
                  : isFailed
                  ? 'Processing Error'
                  : 'Autonomous Intelligence Pipeline'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
                {job.progress_pct}%
              </span>
            </div>
            <p className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1.5">
              {!isComplete && !isFailed && <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
              {job.message}
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          title="Dismiss status"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-3.5 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isComplete
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : isFailed
              ? 'bg-rose-500'
              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-400 animate-pulse'
          }`}
          style={{ width: `${Math.max(8, job.progress_pct)}%` }}
        />
      </div>
    </div>
  );
}
