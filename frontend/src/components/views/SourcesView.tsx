import { useState } from 'react';
import {
  FileAudio,
  Trash2,
  Clock,
  Calendar,
  Eye,
  ShieldCheck,
  X,
  FileText
} from 'lucide-react';
import { SourceItem } from '../../types/engine';

interface SourcesViewProps {
  sources: SourceItem[];
  onDeleteSource: (sourceId: string) => Promise<unknown>;
  onOpenCaptureModal?: () => void;
}

export default function SourcesView({
  sources,
  onDeleteSource,
  onOpenCaptureModal
}: SourcesViewProps) {
  const [selectedTranscript, setSelectedTranscript] = useState<{ title: string; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatDuration = (secs: number) => {
    if (!secs) return '0:45';
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  const handleDeleteClick = async (sourceId: string) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to permanently delete this audio recording and its transcript? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(sourceId);
      await onDeleteSource(sourceId);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">
              Data Sovereignty & Privacy
            </span>
            <span className="text-white/30">•</span>
            <span className="text-xs text-white/50">{sources.length} Total Captured Sources</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Sources & Retention
          </h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">
            Ghostscribe only stores audio and transcripts that you explicitly permit.
            You maintain full data sovereignty: view raw transcripts or delete recordings anytime.
          </p>
        </div>

        {onOpenCaptureModal && (
          <button
            onClick={onOpenCaptureModal}
            className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-bold transition-all shadow-lg shadow-white/10 active:scale-95 self-start sm:self-auto"
          >
            Capture New Audio
          </button>
        )}
      </div>

      {/* Retention Guarantee Alert */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-white/70 leading-relaxed">
          <strong className="text-white">Strict Retention & Consent Architecture:</strong> All speech input is encrypted in transit and at rest.
          Deleting a source permanently wipes its associated audio, chunks, and raw transcript text from the system.
        </div>
      </div>

      {/* Sources List */}
      {sources.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-white/[0.01] p-12 text-center">
          <FileAudio className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No captured sources yet</h3>
          <p className="text-xs text-white/40 mt-1">Record a session or upload audio to begin.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sources.map((src) => {
            const isDeleting = deletingId === src.id;

            return (
              <div
                key={src.id}
                className="rounded-2xl border border-white/10 bg-[#0e0e11] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all"
              >
                {/* Left Info */}
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                    <FileAudio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">{src.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/40 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(src.duration_seconds)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(src.created_at)}
                      </span>
                      <span>•</span>
                      <span className="capitalize px-2 py-0.5 rounded bg-white/5 text-white/60 text-[10px] font-bold">
                        {src.source_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {src.transcript && (
                    <button
                      onClick={() =>
                        setSelectedTranscript({
                          title: src.title,
                          text: src.transcript || ''
                        })
                      }
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-white/60" />
                      <span>View Transcript</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteClick(src.id)}
                    disabled={isDeleting}
                    className="p-2 rounded-xl text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete recording & transcript"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transcript Drawer Modal */}
      {selectedTranscript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className="bg-[#0f0f12] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  Transcript: {selectedTranscript.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTranscript(null)}
                className="p-1 rounded-lg text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto font-mono text-xs text-white/80 leading-relaxed space-y-3 whitespace-pre-line select-text">
              {selectedTranscript.text}
            </div>

            <div className="px-6 py-3 border-t border-white/10 bg-white/[0.01] flex justify-end">
              <button
                onClick={() => setSelectedTranscript(null)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
