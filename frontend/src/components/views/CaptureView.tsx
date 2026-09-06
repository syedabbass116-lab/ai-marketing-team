import { useState } from 'react';
import {
  Mic,
  UploadCloud,
  Zap,
  Radio,
  Sparkles,
  ShieldCheck,
  Play,
  Pause,
  Square,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { SourceType } from '../../types/engine';

interface CaptureViewProps {
  onSubmitAudio: (blob: Blob, title?: string, type?: SourceType) => Promise<unknown>;
  onSubmitThought: (text: string, title?: string) => Promise<unknown>;
  onNavigateHome?: () => void;
}

export default function CaptureView({
  onSubmitAudio,
  onSubmitThought,
  onNavigateHome
}: CaptureViewProps) {
  const [activeTab, setActiveTab] = useState<'record' | 'upload' | 'quick' | 'event'>('record');
  const [recordingTitle, setRecordingTitle] = useState('');
  const [quickThoughtText, setQuickThoughtText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    state: recState,
    formattedTime,
    waveformLevels,
    errorMessage,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecorder
  } = useAudioRecorder(60);

  const handleStopAndProcess = async () => {
    try {
      setIsSubmitting(true);
      const blob = await stopRecording();
      if (blob && blob.size > 0) {
        const type: SourceType = activeTab === 'event' ? 'event' : 'recording';
        const title = recordingTitle.trim() || (activeTab === 'event' ? 'Event Session Capture' : 'Voice Recording');
        await onSubmitAudio(blob, title, type);
        resetRecorder();
        if (onNavigateHome) onNavigateHome();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    try {
      setIsSubmitting(true);
      const title = recordingTitle.trim() || selectedFile.name.replace(/\.[^/.]+$/, '');
      await onSubmitAudio(selectedFile, title, 'uploaded_audio');
      setSelectedFile(null);
      if (onNavigateHome) onNavigateHome();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickThoughtSubmit = async () => {
    if (!quickThoughtText.trim()) return;
    try {
      setIsSubmitting(true);
      await onSubmitThought(quickThoughtText.trim(), 'Quick Thought');
      setQuickThoughtText('');
      if (onNavigateHome) onNavigateHome();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">
            Autonomous Input Station
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Capture Real-World Input
        </h1>
        <p className="text-sm text-white/50 mt-1">
          Don't force yourself to come up with post ideas. Speak your mind, record a permitted meeting, or capture an event observation.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-white/[0.03] border border-white/10 rounded-2xl">
        <button
          onClick={() => setActiveTab('record')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'record'
              ? 'bg-white text-black shadow-lg shadow-white/10'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Record Audio</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'upload'
              ? 'bg-white text-black shadow-lg shadow-white/10'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload File</span>
        </button>

        <button
          onClick={() => setActiveTab('quick')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'quick'
              ? 'bg-white text-black shadow-lg shadow-white/10'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Quick Thought</span>
        </button>

        <button
          onClick={() => setActiveTab('event')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'event'
              ? 'bg-white text-black shadow-lg shadow-white/10'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Event Mode</span>
        </button>
      </div>

      {/* Card Content */}
      <div className="rounded-3xl border border-white/10 bg-[#0e0e11] p-8 sm:p-12 shadow-2xl relative">
        {/* TAB 1: RECORD & TAB 4: EVENT MODE */}
        {(activeTab === 'record' || activeTab === 'event') && (
          <div className="text-center space-y-8 max-w-lg mx-auto">
            <input
              type="text"
              value={recordingTitle}
              onChange={(e) => setRecordingTitle(e.target.value)}
              placeholder={
                activeTab === 'event'
                  ? 'Conference or Event Name (e.g. SaaStr 2026)'
                  : 'Recording Title (optional)'
              }
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder:text-white/30 text-center focus:outline-none focus:border-indigo-500"
            />

            <div>
              <div className="font-mono text-6xl font-black tracking-widest text-white">
                {formattedTime}
              </div>
              <p className="text-xs text-white/40 mt-2 uppercase tracking-widest font-semibold">
                {recState === 'recording'
                  ? 'Recording live audio • Up to 60 minutes'
                  : recState === 'paused'
                  ? 'Recording Paused'
                  : 'Ready to Record'}
              </p>
            </div>

            {/* Waveform */}
            {recState === 'recording' && (
              <div className="flex items-center justify-center gap-2 h-16">
                {waveformLevels.map((lvl, idx) => (
                  <div
                    key={idx}
                    className="w-2 rounded-full bg-gradient-to-t from-indigo-500 to-emerald-400 transition-all duration-100"
                    style={{ height: `${Math.max(14, lvl * 60)}px` }}
                  />
                ))}
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 pt-2">
              {recState === 'idle' && (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-black hover:bg-white/90 text-sm font-black transition-all shadow-2xl shadow-white/20 active:scale-95"
                >
                  <Mic className="w-5 h-5 text-indigo-600" />
                  <span>
                    {activeTab === 'event' ? 'Start Event Capture' : 'Start Recording'}
                  </span>
                </button>
              )}

              {(recState === 'recording' || recState === 'paused') && (
                <>
                  {recState === 'recording' ? (
                    <button
                      onClick={pauseRecording}
                      className="flex items-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Pause</span>
                    </button>
                  ) : (
                    <button
                      onClick={resumeRecording}
                      className="flex items-center gap-2 px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                    >
                      <Play className="w-4 h-4" />
                      <span>Resume</span>
                    </button>
                  )}

                  <button
                    onClick={handleStopAndProcess}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-black transition-all shadow-xl shadow-white/20 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Square className="w-4 h-4 fill-current" />
                    )}
                    <span>Stop & Analyze</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD AUDIO */}
        {activeTab === 'upload' && (
          <div className="max-w-md mx-auto space-y-5">
            <input
              type="text"
              value={recordingTitle}
              onChange={(e) => setRecordingTitle(e.target.value)}
              placeholder="Session Title (optional)"
              className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
            />

            <label className="block p-10 border-2 border-dashed border-white/15 hover:border-white/30 rounded-3xl text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-white/[0.03]">
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.aac,.flac"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setSelectedFile(f);
                }}
              />
              <UploadCloud className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
              {selectedFile ? (
                <div>
                  <p className="text-base font-bold text-white">{selectedFile.name}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-base font-bold text-white">Select or drop audio file</p>
                  <p className="text-xs text-white/40 mt-1">
                    MP3, WAV, M4A, WEBM, OGG (up to 25MB)
                  </p>
                </div>
              )}
            </label>

            {selectedFile && (
              <button
                onClick={handleFileUpload}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-white text-black hover:bg-white/90 text-sm font-black transition-all shadow-xl shadow-white/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                )}
                <span>Upload & Start Pipeline</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 3: QUICK THOUGHT */}
        {activeTab === 'quick' && (
          <div className="max-w-xl mx-auto space-y-5">
            <p className="text-xs text-white/60 leading-relaxed">
              Have an idea, customer feedback quote, or counterintuitive observation?
              Simply type or paste it below. Ghostscribe extracts the core premise and builds Today's Post.
            </p>

            <textarea
              value={quickThoughtText}
              onChange={(e) => setQuickThoughtText(e.target.value)}
              rows={6}
              placeholder="Speak or type your raw thought... No structured prompt required."
              className="w-full rounded-2xl bg-black/50 border border-white/10 p-5 text-white text-sm focus:outline-none focus:border-indigo-500 font-sans"
            />

            <button
              onClick={handleQuickThoughtSubmit}
              disabled={!quickThoughtText.trim() || isSubmitting}
              className="w-full py-4 rounded-2xl bg-white text-black hover:bg-white/90 text-sm font-black transition-all shadow-xl shadow-white/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-600" />
              )}
              <span>Process Quick Thought</span>
            </button>
          </div>
        )}
      </div>

      {/* Privacy Guarantee */}
      <div className="flex items-center justify-center gap-2 text-xs text-white/40 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Ghostscribe never listens continuously. Audio is only processed upon explicit user action.</span>
      </div>
    </div>
  );
}
