import { useState } from 'react';
import {
  Mic,
  UploadCloud,
  Sparkles,
  ArrowRight,
  Flame,
  Calendar,
  Layers,
  Lightbulb,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useEngine } from '../../hooks/useEngine';
import TodaysPostCard from '../engine/TodaysPostCard';
import CaptureModal from '../engine/CaptureModal';
import ProcessingBanner from '../engine/ProcessingBanner';

interface HomeProps {
  onViewChange?: (view: string) => void;
}

export default function Home({ onViewChange }: HomeProps) {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [initialCaptureTab, setInitialCaptureTab] = useState<'record' | 'upload' | 'quick' | 'event'>('record');

  const {
    todaysPost,
    readyQueue,
    stats,
    opportunities,
    activeJob,
    submitAudio,
    submitThought,
    handlePostAction,
    handleOpportunityGenerate,
    dismissJob
  } = useEngine(activeWorkspace?.id);

  const fullName = user?.user_metadata?.full_name || '';
  const firstName = fullName ? fullName.split(' ')[0] : user?.email?.split('@')[0] || 'there';
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const openCapture = (tab: 'record' | 'upload' | 'quick' | 'event') => {
    setInitialCaptureTab(tab);
    setCaptureModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-[#f0f0f0] font-sans pb-24 relative">
      {/* Background ambient lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '64px 64px'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black to-black pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-10 animate-fadeIn">
        {/* Real-time Processing Banner */}
        <ProcessingBanner job={activeJob} onDismiss={dismissJob} />

        {/* TOP HERO: TODAY'S POST */}
        {todaysPost ? (
          <TodaysPostCard
            post={todaysPost}
            founderName={capitalizedName}
            onApprove={() => handlePostAction('approve')}
            onEdit={(text) => handlePostAction('edit', { content: text })}
            onModifier={(mod, custom) => handlePostAction('edit', { modifier: mod, customInstruction: custom })}
            onRegenerate={() => handlePostAction('regenerate')}
            onSchedule={(dateStr) => handlePostAction('schedule', { scheduledAt: dateStr })}
          />
        ) : (
          /* Polished Empty State */
          <div className="rounded-3xl border border-white/10 bg-[#0e0e11] p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <Mic className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Don't ask what to post.
              </h2>
              <p className="text-sm text-white/50 mt-2 max-w-md mx-auto leading-relaxed">
                Ghostscribe finds the content inside what you already did. Record a 60-second reflection or upload a meeting recording to generate Today's Post.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => openCapture('record')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-black hover:bg-white/90 text-xs font-black transition-all shadow-xl shadow-white/15 active:scale-95"
              >
                <Mic className="w-4 h-4" />
                <span>Start 60-Sec Voice Note</span>
              </button>
              <button
                onClick={() => openCapture('upload')}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-bold transition-all"
              >
                <UploadCloud className="w-4 h-4 text-white/60" />
                <span>Upload Audio File</span>
              </button>
            </div>
          </div>
        )}

        {/* QUICK CAPTURE PROMPT BAR */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Capture real-time founder input</h3>
              <p className="text-xs text-white/40">Meetings, voice notes, customer observations, or quick thoughts.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => openCapture('record')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/5"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-400" />
              <span>Record</span>
            </button>
            <button
              onClick={() => openCapture('quick')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/5"
            >
              <span>Quick Thought</span>
            </button>
            <button
              onClick={() => openCapture('event')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/5"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Event Mode</span>
            </button>
          </div>
        </div>

        {/* POST QUEUE: TODAY / THIS WEEK / IDEAS */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Post Queue & Pipeline</h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-white/50">
              <span>TODAY: <strong className="text-emerald-400">{stats.ready_count}</strong></span>
              <span>THIS WEEK: <strong className="text-indigo-400">{stats.week_count}</strong></span>
              <span>IDEAS: <strong className="text-amber-400">{stats.opportunities_count}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Ready This Week */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Ready This Week
                </span>
                <span className="text-[10px] text-white/40 font-mono">{readyQueue.length} posts</span>
              </div>

              {readyQueue.length === 0 ? (
                <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] text-xs text-white/40 text-center">
                  1 primary post ready for today. Capture more audio to stack your weekly pipeline.
                </div>
              ) : (
                readyQueue.map((qp, idx) => (
                  <div
                    key={qp.id || idx}
                    className="p-4 rounded-2xl border border-white/10 bg-[#0e0e11] hover:border-white/20 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-[10px] text-white/40 font-bold uppercase">
                      <span className="capitalize">{qp.angle || 'contrarian'}</span>
                      <span className="text-emerald-400">{qp.metrics?.icp_relevance || 92}% Match</span>
                    </div>
                    <p className="text-xs text-white/90 line-clamp-3 leading-relaxed">{qp.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Column 2 & 3: Content Opportunities Teaser */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  Discovered Content Opportunities
                </span>
                {onViewChange && (
                  <button
                    onClick={() => onViewChange('opportunities')}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <span>View all ({opportunities.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {opportunities.slice(0, 4).map((opp) => (
                  <div
                    key={opp.id}
                    className="p-4 rounded-2xl border border-white/10 bg-[#0e0e11] hover:bg-[#121216] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase text-white/40 mb-1.5">
                        <span className="text-indigo-400 truncate max-w-[120px]">{opp.content_type}</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {opp.overall_score}%
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-2">{opp.title}</h4>
                      <p className="text-[11px] text-white/50 mt-1 line-clamp-2 leading-relaxed">{opp.summary}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-white/30 capitalize">{opp.recommended_angle} angle</span>
                      <button
                        onClick={() => handleOpportunityGenerate(opp.id, opp.recommended_angle)}
                        className="text-[11px] font-bold text-white hover:text-indigo-400 flex items-center gap-1 transition-colors"
                      >
                        <span>Draft Post</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Capture Modal Dialog */}
      <CaptureModal
        isOpen={captureModalOpen}
        onClose={() => setCaptureModalOpen(false)}
        onSubmitAudio={submitAudio}
        onSubmitThought={submitThought}
        initialTab={initialCaptureTab}
      />
    </div>
  );
}
