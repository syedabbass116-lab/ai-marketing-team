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
  Linkedin,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { EnginePost } from '../../types/engine';
import ProvenanceModal from './ProvenanceModal';
import QuickEditorModal from './QuickEditorModal';

interface TodaysPostCardProps {
  post: EnginePost | null;
  posts?: EnginePost[];
  founderName?: string;
  onApprove: (targetPost?: EnginePost) => Promise<unknown>;
  onEdit: (newContent: string, targetPost?: EnginePost) => Promise<unknown>;
  onModifier: (modifier: string, customInstruction?: string, targetPost?: EnginePost) => Promise<unknown>;
  onRegenerate: (targetPost?: EnginePost) => Promise<unknown>;
  onSchedule: (dateStr: string, targetPost?: EnginePost) => Promise<unknown>;
  onPublish?: (targetPost?: EnginePost) => Promise<unknown>;
}

export default function TodaysPostCard({
  post,
  posts = [],
  founderName = 'there',
  onApprove,
  onEdit,
  onModifier,
  onRegenerate,
  onSchedule,
  onPublish
}: TodaysPostCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [showScheduleInput, setShowScheduleInput] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [isActionBusy, setIsActionBusy] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Consolidate posts array
  const postsList = posts && posts.length > 0 ? posts : (post ? [post] : []);
  const safeIndex = activeIndex < postsList.length ? activeIndex : 0;
  const currentPost = postsList[safeIndex] || post;

  if (!currentPost) return null;

  const isApproved = currentPost.status === 'approved' || currentPost.status === 'published' || currentPost.status === 'scheduled';
  const totalSlides = postsList.length;

  const handleNextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  };

  const handlePrevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (diff > 40) handleNextSlide(); // Swipe left -> Next slide
    if (diff < -40) handlePrevSlide(); // Swipe right -> Prev slide
    setTouchStart(null);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentPost.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleApproveClick = async () => {
    try {
      setIsActionBusy(true);
      await onApprove(currentPost);
    } finally {
      setIsActionBusy(false);
    }
  };

  const handleScheduleConfirm = async () => {
    if (!scheduleDate) return;
    try {
      setIsActionBusy(true);
      await onSchedule(scheduleDate, currentPost);
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

      {/* Top Slide Navigation Bar (If 3 posts generated) */}
      {totalSlides > 1 && (
        <div className="mb-6 p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                  {totalSlides} Post{totalSlides !== 1 ? 's' : ''} Generated
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  Slide {safeIndex + 1} of {totalSlides}
                </span>
              </div>
              <p className="text-[11px] text-white/50">
                Swipe right or click slide buttons to view alternate angles
              </p>
            </div>
          </div>

          {/* Slide Deck Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {postsList.map((p, idx) => (
              <button
                key={p.id || idx}
                onClick={() => setActiveIndex(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize shrink-0 flex items-center gap-1.5 ${
                  idx === safeIndex
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-[0_4px_16px_rgba(99,102,241,0.45)] border border-indigo-300/40 ring-1 ring-white/20 scale-[1.02]'
                    : 'bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] border border-white/10 hover:border-white/20 shadow-sm'
                }`}
              >
                <span>{p.angle ? p.angle.replace('_', ' ') : `Angle ${idx + 1}`}</span>
              </button>
            ))}
          </div>

          {/* Slide Arrow Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handlePrevSlide}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/10 hover:border-white/20 active:scale-95 shadow-md"
              title="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextSlide}
              className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white transition-all border border-indigo-500/30 hover:border-indigo-400/50 active:scale-95 flex items-center gap-1 text-xs font-bold px-3 shadow-md shadow-indigo-500/10"
              title="Next slide (Swipe right)"
            >
              <span>Next Card</span>
              <ChevronRight className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>
      )}

      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">
              {totalSlides > 1 ? `Post Angle ${safeIndex + 1} of ${totalSlides}` : "Today's Post"}
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
          <span>Source: {currentPost.provenance?.source_title || 'Voice recording'}</span>
          <ExternalLink className="w-3 h-3 text-white/40" />
        </button>
      </div>

      {/* Hero Post Content Container with Touch Swipe Gesture & 3D Raised Card Stack */}
      <div
        className="py-6 sm:py-8 relative z-10 touch-pan-y cursor-grab active:cursor-grabbing select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 3D Stack Effect Background Cards (Layered & Raised Behind Active Card) */}
        {totalSlides > 1 && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {/* Third layer card (deep background) */}
            {totalSlides > 2 && (
              <div
                className="absolute inset-x-8 top-12 bottom-1 rounded-3xl bg-gradient-to-b from-[#1e1b4b]/40 to-[#0f172a]/20 border border-indigo-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.9)] transform scale-[0.92] translate-y-7 opacity-50 transition-all duration-500 blur-[0.5px]"
                style={{ transformOrigin: 'top center' }}
              />
            )}
            {/* Second layer card (mid background) */}
            <div
              className="absolute inset-x-4 top-8 bottom-3 rounded-3xl bg-gradient-to-b from-[#1e1b4b]/60 to-[#111116]/80 border border-indigo-400/30 shadow-[0_25px_60px_rgba(0,0,0,0.95)] transform scale-[0.96] translate-y-3.5 opacity-80 transition-all duration-500"
              style={{ transformOrigin: 'top center' }}
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-300/40 to-transparent" />
            </div>
          </div>
        )}

        {/* Foreground Primary Raised & Highlighted Card */}
        <div className="relative rounded-2xl bg-gradient-to-b from-[#1a1a24]/95 via-[#12121a]/98 to-[#0c0c10] border border-indigo-500/30 ring-1 ring-white/15 p-6 sm:p-8 md:p-9 backdrop-blur-xl shadow-[0_25px_70px_-10px_rgba(0,0,0,0.95),0_0_50px_rgba(99,102,241,0.22)] transition-all duration-300 hover:border-indigo-400/50 hover:shadow-[0_30px_80px_-10px_rgba(0,0,0,0.95),0_0_60px_rgba(99,102,241,0.3)]">
          {/* Top Edge Gloss Highlight */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-300/70 to-transparent rounded-t-2xl" />
          
          {/* Floating Angle Badge */}
          <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
              <span>{currentPost.angle ? `${currentPost.angle.replace('_', ' ')} Perspective` : 'Core Perspective'}</span>
            </div>
            
            {totalSlides > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-white/50 hidden sm:inline">
                  Card {safeIndex + 1} of {totalSlides}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
                  Swipe ← →
                </span>
              </div>
            )}
          </div>

          {/* Main Card Content */}
          <p className="text-base sm:text-lg md:text-xl text-white/95 leading-relaxed font-normal whitespace-pre-line tracking-normal select-text">
            {currentPost.content}
          </p>
        </div>

        {/* Source of Truth Transcript Disclosure */}
        {(currentPost.transcript || currentPost.provenance?.evidence_quote) && (
          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/70 space-y-1.5 shadow-inner">
            <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
              <Compass className="w-3.5 h-3.5" />
              <span>Grounded in What You Said (Source Transcript)</span>
            </div>
            <p className="italic text-white/60 line-clamp-3 leading-relaxed">
              "{currentPost.transcript || currentPost.provenance?.evidence_quote}"
            </p>
          </div>
        )}
      </div>

      {/* Metadata Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5 border-y border-white/5 text-xs text-white/60 relative z-10">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block mb-1">
            Content Angle
          </span>
          <span className="text-white font-bold capitalize flex items-center gap-1.5 text-sm">
            <Flame className="w-4 h-4 text-amber-400" />
            {currentPost.angle || 'Contrarian'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block mb-1">
            ICP Relevance
          </span>
          <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-sm">
            <Award className="w-4 h-4 text-emerald-400" />
            {currentPost.metrics?.icp_relevance || 94}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block mb-1">
            Originality
          </span>
          <span className="text-indigo-400 font-bold flex items-center gap-1.5 text-sm">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            {currentPost.metrics?.originality || 89}%
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block mb-1">
            Confidence
          </span>
          <span className="text-cyan-400 font-bold text-sm">
            {currentPost.metrics?.confidence || 95}%
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
            onClick={() => onRegenerate(currentPost)}
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
              onClick={() => (onPublish ? onPublish(currentPost) : handleCopy())}
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
        provenance={currentPost.provenance}
        isOpen={provenanceOpen}
        onClose={() => setProvenanceOpen(false)}
      />

      <QuickEditorModal
        isOpen={editorOpen}
        initialContent={currentPost.content}
        onClose={() => setEditorOpen(false)}
        onSave={(text) => onEdit(text, currentPost)}
        onApplyModifier={(mod, custom) => onModifier(mod, custom, currentPost)}
        onRegenerate={() => onRegenerate(currentPost)}
      />
    </div>
  );
}
