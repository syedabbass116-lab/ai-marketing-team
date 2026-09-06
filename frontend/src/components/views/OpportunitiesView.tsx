import { useState } from 'react';
import {
  ArrowRight,
  Flame,
  FileText
} from 'lucide-react';
import { ContentOpportunity } from '../../types/engine';

interface OpportunitiesViewProps {
  opportunities: ContentOpportunity[];
  onGeneratePost: (oppId: string, angle?: string) => Promise<unknown>;
  onNavigateHome?: () => void;
}

export default function OpportunitiesView({
  opportunities,
  onGeneratePost,
  onNavigateHome
}: OpportunitiesViewProps) {
  const [filter, setFilter] = useState<'all' | 'ready' | 'used'>('all');
  const [selectedAngles, setSelectedAngles] = useState<Record<string, string>>({});
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const filteredOpps = opportunities.filter((o) => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  const handleCreatePostClick = async (opp: ContentOpportunity) => {
    try {
      setGeneratingId(opp.id);
      const angle = selectedAngles[opp.id] || opp.recommended_angle;
      await onGeneratePost(opp.id, angle);
      if (onNavigateHome) onNavigateHome();
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleAngleChange = (oppId: string, angle: string) => {
    setSelectedAngles((prev) => ({ ...prev, [oppId]: angle }));
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">
              Content Pipeline
            </span>
            <span className="text-white/30">•</span>
            <span className="text-xs text-white/50">{opportunities.length} Total Opportunities Found</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Content Opportunities
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            Ghostscribe extracted these high-scoring ideas from your recorded speech and sessions.
            Select an angle and click <strong>Create Post</strong> to generate an authentic draft immediately.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/10 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            All ({opportunities.length})
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'ready' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            Ready
          </button>
          <button
            onClick={() => setFilter('used')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'used' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
            }`}
          >
            Published
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredOpps.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-12 text-center">
          <FileText className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No opportunities in this view</h3>
          <p className="text-xs text-white/40 mt-1">Capture new audio to detect more content opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOpps.map((opp) => {
            const currentAngle = selectedAngles[opp.id] || opp.recommended_angle || 'contrarian';
            const isGenerating = generatingId === opp.id;

            return (
              <div
                key={opp.id}
                className="group relative rounded-2xl border border-white/10 bg-[#0e0e11] hover:bg-[#121216] p-6 sm:p-7 transition-all duration-300 shadow-xl flex flex-col justify-between hover:border-white/20"
              >
                <div>
                  {/* Card Top Meta */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                      {opp.content_type || 'Contrarian insight'}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{opp.overall_score || 91}% Viability</span>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-white transition-colors leading-snug">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-white/60 mt-2 leading-relaxed">
                    {opp.summary}
                  </p>

                  {/* Why Interesting Breakdown */}
                  <div className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">
                      Why Ghostscribe Chose This
                    </span>
                    <p className="text-xs text-white/80 leading-relaxed font-medium">
                      {opp.why_interesting}
                    </p>
                  </div>

                  {/* Scores Strip */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-white/50">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex justify-between items-center">
                      <span>ICP Relevance</span>
                      <strong className="text-emerald-400">{opp.icp_relevance || 94}%</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex justify-between items-center">
                      <span>Originality</span>
                      <strong className="text-indigo-400">{opp.originality || 89}%</strong>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions & Angle Selector */}
                <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
                  {/* Angles Pills */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-2">
                      Select Angle:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(opp.available_angles || ['contrarian', 'story', 'framework', 'educational']).map((ang) => (
                        <button
                          key={ang}
                          onClick={() => handleAngleChange(opp.id, ang)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                            currentAngle === ang
                              ? 'bg-white text-black shadow-md'
                              : 'bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white'
                          }`}
                        >
                          {ang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="text-[11px] text-white/40 truncate max-w-[180px]">
                      Source: {opp.source_title || 'Voice recording'}
                    </div>

                    <button
                      onClick={() => handleCreatePostClick(opp)}
                      disabled={isGenerating}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-black transition-all shadow-lg shadow-white/10 active:scale-95 disabled:opacity-50"
                    >
                      <span>{isGenerating ? 'Generating...' : 'Create Post'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
