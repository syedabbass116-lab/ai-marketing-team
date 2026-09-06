import { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw, Check, Wand2 } from 'lucide-react';

interface QuickEditorModalProps {
  isOpen: boolean;
  initialContent: string;
  onClose: () => void;
  onSave: (newContent: string) => void;
  onApplyModifier: (modifier: string, customInstruction?: string) => Promise<unknown>;
  onRegenerate: () => Promise<unknown>;
}

const MODIFIERS = [
  { id: 'shorter', label: 'Shorter', desc: 'Cut fluff & shorten' },
  { id: 'more_direct', label: 'More Direct', desc: 'Punchier stance' },
  { id: 'more_personal', label: 'More Personal', desc: 'Founder observation' },
  { id: 'stronger_hook', label: 'Stronger Hook', desc: 'Arresting opening' },
  { id: 'less_salesy', label: 'Less Salesy', desc: 'Pure educational value' },
  { id: 'more_conversational', label: 'More Conversational', desc: 'Coffee chat tone' }
];

export default function QuickEditorModal({
  isOpen,
  initialContent,
  onClose,
  onSave,
  onApplyModifier,
  onRegenerate
}: QuickEditorModalProps) {
  const [content, setContent] = useState(initialContent);
  const [customInstruction, setCustomInstruction] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [activePill, setActivePill] = useState<string | null>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  if (!isOpen) return null;

  const handleModifierClick = async (modId: string) => {
    try {
      setIsApplying(true);
      setActivePill(modId);
      await onApplyModifier(modId, customInstruction);
    } catch (e) {
      console.error(e);
    } finally {
      setIsApplying(false);
      setActivePill(null);
    }
  };

  const handleRegenClick = async () => {
    try {
      setIsApplying(true);
      await onRegenerate();
    } catch (e) {
      console.error(e);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="bg-[#0f0f11] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Quick Tone & Polish</h3>
              <p className="text-xs text-white/50">One-tap tone adjustments or direct editing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1-Tap Tone Modifier Pills */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/40 block mb-2.5">
              1-Tap Tone Adjustments
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MODIFIERS.map((mod) => {
                const isActive = activePill === mod.id && isApplying;
                return (
                  <button
                    key={mod.id}
                    disabled={isApplying}
                    onClick={() => handleModifierClick(mod.id)}
                    className={`flex flex-col text-left px-3.5 py-2.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-indigo-600/30 border-indigo-500 text-white animate-pulse'
                        : 'bg-white/[0.02] border-white/10 text-white/80 hover:bg-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      {mod.label}
                    </span>
                    <span className="text-[10px] text-white/40 mt-0.5">{mod.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Regenerate Action */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div>
              <p className="text-xs font-semibold text-white">Need a completely fresh take?</p>
              <p className="text-[11px] text-white/40">Pivots the angle while staying true to your recorded source.</p>
            </div>
            <button
              onClick={handleRegenClick}
              disabled={isApplying}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isApplying ? 'animate-spin' : ''}`} />
              <span>Regenerate Angle</span>
            </button>
          </div>

          {/* Direct Textarea Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">
                Post Text (Direct Edit)
              </label>
              <span className="text-[10px] text-white/40 font-mono">
                {content.length} characters • {content.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={9}
              className="w-full rounded-xl bg-black/50 border border-white/10 p-4 text-white text-sm leading-relaxed focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              placeholder="Post content..."
            />
          </div>

          {/* Optional Advanced Instruction */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/40 block mb-1.5">
              Optional Custom Note (Optional)
            </label>
            <input
              type="text"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="e.g. 'Emphasize the 4x conversion boost in the middle'"
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3.5 py-2.5 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-white/60 hover:text-white text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(content);
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-bold transition-all shadow-lg shadow-white/10 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
