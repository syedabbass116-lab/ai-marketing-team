import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  RefreshCw,
  Calendar,
  Compass,
  ExternalLink,
  Flame,
  Award,
  ShieldCheck,
  Linkedin
} from 'lucide-react';
import { EnginePost } from '../../types/engine';
import ProvenanceModal from './ProvenanceModal';
import QuickEditorModal from './QuickEditorModal';

interface TodaysPostCardProps {
  post: EnginePost | null;
  founderName?: string;
  onApprove: () => Promise<unknown>;
  onEdit: (newContent: string) => Promise<unknown>;
  onModifier: (modifier: string, customInstruction?: string) => Promise<unknown>;
  onRegenerate: () => Promise<unknown>;
  onSchedule: (dateStr: string) => Promise<unknown>;
  onPublish?: () => Promise<unknown>;
}

export default function TodaysPostCard({
  post,
  founderName = 'there',
  onApprove,
  onEdit,
  onModifier,
  onRegenerate,
  onSchedule,
  onPublish
}: TodaysPostCardProps) {
  const [copied, setCopied] = useState(false);
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [showScheduleInput, setShowScheduleInput] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [isActionBusy, setIsActionBusy] = useState(false);

  if (!post) return null;

  const isApproved = post.status === 'approved' || post.status === 'published' || post.status === 'scheduled';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleApproveClick = async () => {
    try {
      setIsActionBusy(true);
      await onApprove();
    } finally {
      setIsActionBusy(false);
    }
  };

  const handleScheduleConfirm = async () => {
    if (!scheduleDate) return;
    try {
      setIsActionBusy(true);
      await onSchedule(scheduleDate);
      setShowScheduleInput(false);
    } finally {
      setIsActionBusy(false);
    }
  };

  return (
    <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#111114] to-[#0a0a0c] p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden animate-fadeIn">
      {/* Subtle Ambient Background Accent */}
      <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-indigo-500/[0.08] blur-[100px] pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue-500/[0.06] blur-[100px] pointer-events-none" />

      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">
              Today's Post
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-emerald-400/90 uppercase tracking-widest">
              Ready to Publish
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Good morning, {founderName}. Your post is ready.
          </h2>
        </div>

        {/* Clickable Provenance Badge */}
        <button
          onClick={() => setProvenanceOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white transition-all text-xs font-semibold group self-start sm:self-auto shadow-inner"
        >
          <Compass className="w-4 h-4 text-indigo-400 group-hover:rotate-45 transition-transform duration-300" />
          <span>Source: {post.provenance?.source_title || 'Voice recording'}</span>
          <ExternalLink className="w-3 h-3 text-white/40" />
        </button>
      </div>

      {/* Hero Post Content Container */}
      <div className="py-8 sm:py-10 relative z-10">
        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-inner relative group">
          <p className="text-base sm:text-lg md:text-xl text-white/95 leading-relaxed font-normal whitespace-pre-line tracking-normal select-text">
            {post.content}
          </p>
        </div>
      </div>

      {/* Metadata Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5 border-y border-white/5 text-xs text-white/60 relative z-10">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block mb-1">
            Content Angle
          </span>
          <span className="text-white font-bold capitalize flex items-center gap-1.5 text-sm">
            <Flame className="w-4 h-4 text-amber-400" />
            {post.angle || 'Contrarian'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block mb-1">
            ICP Relevance
          </span>
          <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-sm">
            <Award className="w-4 h-4 text-emerald-400" />
            {post.metrics?.icp_relevance || 94}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block mb-1">
            Originality
          </span>
          <span className="text-indigo-400 font-bold flex items-center gap-1.5 text-sm">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            {post.metrics?.originality || 89}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block mb-1">
            Confidence
          </span>
          <span className="text-cyan-400 font-bold text-sm">
            {post.metrics?.confidence || 95}%
          </span>
        </div>
      </div>

      {/* Actions Toolbar */}
      <div className="pt-6 flex flex-wrap items-center justify-between gap-4 relative z-10">
        {/* Left Status & Primary Action */}
        <div className="flex items-center gap-3">
          {!isApproved ? (
            <button
              onClick={handleApproveClick}
              disabled={isActionBusy}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black hover:bg-white/90 text-sm font-bold transition-all shadow-xl shadow-white/10 active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Approve Post</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Approved ✓</span>
            </div>
          )}

          {/* Quick Edit */}
          <button
            onClick={() => setEditorOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-sm font-semibold transition-all hover:border-white/20 active:scale-95"
          >
            <Edit3 className="w-4 h-4 text-white/60" />
            <span>Edit</span>
          </button>

          {/* Regenerate */}
          <button
            onClick={onRegenerate}
            disabled={isActionBusy}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/80 hover:text-white text-sm font-semibold transition-all hover:border-white/20 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 text-white/60" />
            <span>Regenerate</span>
          </button>
        </div>

        {/* Right Publishing & Distribution Actions */}
        <div className="flex items-center gap-3">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold transition-all active:scale-95 ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/60" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy'}</span>
          </button>

          {/* Schedule Action */}
          <button
            onClick={() => setShowScheduleInput(!showScheduleInput)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/80 hover:text-white text-sm font-semibold transition-all hover:border-white/20"
          >
            <Calendar className="w-4 h-4 text-white/60" />
            <span>Schedule</span>
          </button>

          {/* Direct LinkedIn Publish if approved */}
          {isApproved && (
            <button
              onClick={onPublish || handleCopy}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0077b5] hover:bg-[#006097] text-white text-sm font-bold transition-all shadow-lg shadow-[#0077b5]/20 active:scale-95"
            >
              <Linkedin className="w-4 h-4 fill-current" />
              <span>Copy to LinkedIn</span>
            </button>
          )}
        </div>
      </div>

      {/* Schedule Drawer */}
      {showScheduleInput && (
        <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-wrap items-center gap-3 animate-fadeIn">
          <input
            type="datetime-local"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleScheduleConfirm}
            disabled={!scheduleDate || isActionBusy}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-40"
          >
            Confirm Schedule
          </button>
          <button
            onClick={() => setShowScheduleInput(false)}
            className="text-xs text-white/50 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Modals */}
      <ProvenanceModal
        provenance={post.provenance}
        isOpen={provenanceOpen}
        onClose={() => setProvenanceOpen(false)}
      />

      <QuickEditorModal
        isOpen={editorOpen}
        initialContent={post.content}
        onClose={() => setEditorOpen(false)}
        onSave={onEdit}
        onApplyModifier={onModifier}
        onRegenerate={onRegenerate}
      />
    </div>
  );
}
