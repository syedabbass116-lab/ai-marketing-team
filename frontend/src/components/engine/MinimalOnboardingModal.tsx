import { useState } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';

interface MinimalOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    name: string;
    company: string;
    role: string;
    offer: string;
    targetAudience: string;
    samplePost?: string;
  }) => Promise<void>;
  initialName?: string;
}

export default function MinimalOnboardingModal({
  isOpen,
  onClose,
  onComplete,
  initialName = ''
}: MinimalOnboardingModalProps) {
  const [name, setName] = useState(initialName);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Founder / CEO');
  const [offer, setOffer] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [samplePost, setSamplePost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !targetAudience.trim()) return;

    try {
      setSubmitting(true);
      await onComplete({
        name: name.trim(),
        company: company.trim(),
        role: role.trim(),
        offer: offer.trim(),
        targetAudience: targetAudience.trim(),
        samplePost: samplePost.trim()
      });
      onClose();
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="bg-[#0f0f12] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Tune Your Content Engine</h3>
              <p className="text-xs text-white/50">Takes 30 seconds. No endless questions.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 font-semibold block mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-white/60 font-semibold block mb-1">Company / Brand</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Studio"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-white/60 font-semibold block mb-1">Your Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Founder & CEO"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-white/60 font-semibold block mb-1">What do you sell / offer?</label>
            <input
              type="text"
              required
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder="e.g. B2B growth consulting, AI workflow automation"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-white/60 font-semibold block mb-1">Who do you want to reach? (ICP)</label>
            <input
              type="text"
              required
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Seed to Series-A SaaS founders, agency owners"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-white/60 font-semibold block mb-1">
              Sample Post or Writing Style <span className="text-white/30">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={samplePost}
              onChange={(e) => setSamplePost(e.target.value)}
              placeholder="Paste a recent LinkedIn post or phrase that matches your authentic voice..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting || !company.trim() || !targetAudience.trim()}
              className="w-full py-3.5 rounded-xl bg-white text-black hover:bg-white/90 font-bold transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 shadow-lg shadow-white/10"
            >
              <span>Activate Content Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
