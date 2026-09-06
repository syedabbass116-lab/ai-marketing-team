import { useState, useRef } from 'react';
import {
  X,
  Mic,
  Square,
  Pause,
  Play,
  UploadCloud,
  Zap,
  Radio,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { SourceType } from '../../types/engine';
import { extractAudioFromMediaFile } from '../../lib/audioExtractor';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitAudio: (blob: Blob, title?: string, type?: SourceType) => Promise<unknown>;
  onSubmitThought: (text: string, title?: string) => Promise<unknown>;
  initialTab?: 'record' | 'upload' | 'quick' | 'event';
}

export default function CaptureModal({
  isOpen,
  onClose,
  onSubmitAudio,
  onSubmitThought,
  initialTab = 'record'
}: CaptureModalProps) {
  const [activeTab, setActiveTab] = useState<'record' | 'upload' | 'quick' | 'event'>(initialTab);
  const [recordingTitle, setRecordingTitle] = useState('');
  const [quickThoughtText, setQuickThoughtText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  if (!isOpen) return null;

  const handleStopAndProcess = async () => {
    try {
      setIsSubmitting(true);
      const audioBlob = await stopRecording();
      if (audioBlob && audioBlob.size > 0) {
        const type: SourceType = activeTab === 'event' ? 'event' : 'recording';
        const title = recordingTitle.trim() || (activeTab === 'event' ? 'Event Session Capture' : 'Voice Recording');
        await onSubmitAudio(audioBlob, title, type);
        resetRecorder();
        onClose();
      }
    } catch (err) {
      console.error('Processing recording failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    try {
      setIsSubmitting(true);
      const title = recordingTitle.trim() || selectedFile.name.replace(/\.[^/.]+$/, '');
      const { blob, isVideo } = await extractAudioFromMediaFile(selectedFile);
      const type: SourceType = isVideo ? 'video' : 'uploaded_audio';
      await onSubmitAudio(blob, title, type);
      setSelectedFile(null);
      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
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
      onClose();
    } catch (err) {
      console.error('Quick thought failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (recState === 'recording' || recState === 'paused') {
      const confirmLeave = window.confirm('Recording is in progress. Are you sure you want to stop and discard it?');
      if (!confirmLeave) return;
      resetRecorder();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="bg-[#0f0f12] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Mode Tabs */}
        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Capture Content Input
              </h2>
              <p className="text-xs text-white/50">
                Ghostscribe extracts publishable thoughts directly from your speech, audio, and video.
              </p>
            </div>
            <button
              onClick={handleModalClose}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Strip */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
            <button
              onClick={() => setActiveTab('record')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'record'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Record</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>MP3 / MP4</span>
            </button>

            <button
              onClick={() => setActiveTab('quick')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'quick'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Thought</span>
            </button>

            <button
              onClick={() => setActiveTab('event')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'event'
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Event</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* TAB 1: RECORD & TAB 4: EVENT */}
          {(activeTab === 'record' || activeTab === 'event') && (
            <div className="space-y-6">
              <input
                type="text"
                value={recordingTitle}
                onChange={(e) => setRecordingTitle(e.target.value)}
                placeholder={activeTab === 'event' ? "Event / Meeting Name (optional)" : "Recording Title (optional)"}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
              />

              {/* Visual Waveform & Timer Container */}
              <div className="py-8 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center">
                <div className="text-4xl font-mono font-black text-white tracking-wider mb-6">
                  {formattedTime}
                </div>

                {/* Animated Audio Waveform */}
                <div className="flex items-center gap-1 h-12 mb-4">
                  {waveformLevels.map((lvl, idx) => (
                    <div
                      key={idx}
                      className={`w-1 rounded-full transition-all duration-75 ${
                        recState === 'recording'
                          ? 'bg-gradient-to-t from-indigo-500 to-indigo-300'
                          : 'bg-white/20'
                      }`}
                      style={{
                        height: `${Math.max(4, lvl * 48)}px`,
                        opacity: recState === 'recording' ? 0.9 : 0.3
                      }}
                    />
                  ))}
                </div>

                {/* State Label */}
                <div className="flex items-center gap-2 text-xs">
                  {recState === 'idle' && (
                    <span className="text-white/40">Ready to record</span>
                  )}
                  {recState === 'recording' && (
                    <span className="flex items-center gap-1.5 text-rose-400 font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Listening to your speech...
                    </span>
                  )}
                  {recState === 'paused' && (
                    <span className="text-amber-400 font-bold">Recording paused</span>
                  )}
                  {recState === 'processing' && (
                    <span className="flex items-center gap-2 text-indigo-400 font-bold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Processing audio buffer...
                    </span>
                  )}
                </div>

                {errorMessage && (
                  <div className="mt-4 flex items-center gap-2 text-rose-400 text-xs px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                {recState === 'idle' && (
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
                  >
                    <Mic className="w-5 h-5 animate-pulse" />
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
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all"
                      >
                        <Pause className="w-4 h-4" />
                        <span>Pause</span>
                      </button>
                    ) : (
                      <button
                        onClick={resumeRecording}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
                      >
                        <Play className="w-4 h-4" />
                        <span>Resume</span>
                      </button>
                    )}

                    <button
                      onClick={handleStopAndProcess}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-black transition-all shadow-xl shadow-white/20 active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Square className="w-4 h-4 fill-current" />
                      )}
                      <span>Stop & Process</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD AUDIO / VIDEO (MP3 / MP4) */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                type="text"
                value={recordingTitle}
                onChange={(e) => setRecordingTitle(e.target.value)}
                placeholder="Media Title (optional)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                  selectedFile
                    ? 'border-indigo-500/50 bg-indigo-500/[0.04]'
                    : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*,.mp3,.mp4,.wav,.m4a,.webm,.ogg,.aac,.flac,.mov,.mkv,.mpeg"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setSelectedFile(f);
                  }}
                />

                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>

                {selectedFile ? (
                  <div className="text-center">
                    <p className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                      <span>{selectedFile.name}</span>
                    </p>
                    <p className="text-xs text-indigo-300 font-semibold mt-1">
                      {selectedFile.type.startsWith('video/') || /\.(mp4|mov|mkv|mpeg)$/i.test(selectedFile.name) ? 'Video File' : 'Audio File'} • {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <p className="text-[11px] text-white/40 mt-1">
                      Click to choose another file
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">Click or drag MP3 / MP4 file here</p>
                    <p className="text-xs text-white/50 mt-1">
                      Supports MP3, MP4, WAV, M4A, WEBM, MOV (Audio & Video up to 25MB)
                    </p>
                  </div>
                )}
              </div>

              {selectedFile && (
                <button
                  onClick={handleFileUpload}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-white text-black hover:bg-white/90 text-xs font-black transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  )}
                  <span>Upload & Analyze Recording</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 3: QUICK THOUGHT */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-500/[0.04] border border-indigo-500/20 text-indigo-300 text-xs leading-relaxed flex items-center gap-2.5">
                <Zap className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>
                  <strong>Quick Thought:</strong> Have a 30-second observation or counterintuitive idea? Jot or dictate it here. Ghostscribe turns it into a high-relevance post immediately.
                </span>
              </div>

              <textarea
                value={quickThoughtText}
                onChange={(e) => setQuickThoughtText(e.target.value)}
                rows={5}
                placeholder="Speak or type whatever is on your mind... (e.g. 'Just spoke with a customer who canceled because of slow onboarding, not price...')"
                className="w-full rounded-xl bg-black/40 border border-white/10 p-4 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500 font-sans"
              />

              <button
                onClick={handleQuickThoughtSubmit}
                disabled={!quickThoughtText.trim() || isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-white text-black hover:bg-white/90 text-xs font-black transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                )}
                <span>Turn Thought into Today's Post</span>
              </button>
            </div>
          )}

          {/* Privacy & Consent Guarantee Footer */}
          <div className="pt-4 border-t border-white/5 flex items-start gap-2.5 text-xs text-white/40">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="text-white/70 font-semibold">Strict Privacy & Consent Enforcement:</span> Audio is only captured when you explicitly press Record. Never records in secret. For meetings, you confirm participant consent.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
