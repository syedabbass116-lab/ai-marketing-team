import { X, ShieldCheck, Quote, Clock, Compass, FileAudio } from 'lucide-react';
import { Provenance } from '../../types/engine';

interface ProvenanceModalProps {
  provenance: Provenance | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProvenanceModal({ provenance, isOpen, onClose }: ProvenanceModalProps) {
  if (!isOpen || !provenance) return null;

  const formatTimestamp = (secs?: number) => {
    if (secs === undefined || secs === null) return '00:00';
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="bg-[#0f0f11] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Content Provenance</h3>
              <p className="text-xs text-white/50">Verified source lineage for this post</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-sm">
          {/* Source Item */}
          <div className="rounded-xl p-4 bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs text-white/50 font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <FileAudio className="w-3.5 h-3.5 text-indigo-400" />
                Original Source Input
              </span>
              <span className="flex items-center gap-1 text-white/40 font-mono">
                <Clock className="w-3 h-3" />
                @{formatTimestamp(provenance.source_timestamp)}
              </span>
            </div>
            <p className="text-white font-medium text-base">{provenance.source_title}</p>
          </div>

          {/* Derived Thought */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/40 block mb-1.5">
              Extracted Thought / Opportunity
            </label>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-white/90 font-medium">
              {provenance.derived_from}
            </div>
          </div>

          {/* Evidence Quote from Source Transcript */}
          {provenance.evidence_quote && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-white/40 block mb-1.5 flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-amber-400" />
                Raw Ground Truth Evidence
              </label>
              <div className="p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 text-amber-200/90 italic text-xs sm:text-sm leading-relaxed">
                "{provenance.evidence_quote}"
              </div>
            </div>
          )}

          {/* Angle Selected */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-xs text-white/50 uppercase font-bold tracking-wider">Editorial Angle</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize">
              {provenance.content_angle} Angle
            </span>
          </div>

          {/* Privacy & Anti-Hallucination Guarantee */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 text-emerald-300 text-xs leading-relaxed">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>
              <strong>Zero Hallucination Guarantee:</strong> Ghostscribe generated this post strictly from your speech truth. No invented statistics, case studies, or claims.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all"
          >
            Close Provenance
          </button>
        </div>
      </div>
    </div>
  );
}
