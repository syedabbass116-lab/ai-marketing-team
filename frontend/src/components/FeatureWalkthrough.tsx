import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  User,
  Layout,
  Library,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const STEPS = [
  {
    title: "Welcome to GhostScribe",
    description:
      "The world's most powerful AI content engine for professional ghostwriters and brand owners.",
    icon: Sparkles,
    iconColor: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    glow: "from-blue-500/30 to-purple-500/30",
  },
  {
    title: "Define Your Brand DNA",
    description:
      "Create Brand Identities to switch between different voices, tones, and audiences instantly.",
    icon: User,
    iconColor: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    glow: "from-purple-500/30 to-pink-500/30",
  },
  {
    title: "The AI Command Center",
    description:
      "Generate high-conversion posts for LinkedIn, Twitter, and Threads using simple natural language.",
    icon: Layout,
    iconColor: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    glow: "from-pink-500/30 to-orange-500/30",
  },
  {
    title: "Your Private Library",
    description:
      "Save your favorite generations to your personal library for future use and repurposing.",
    icon: Library,
    iconColor: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    glow: "from-orange-500/30 to-yellow-500/30",
  },
];

export default function FeatureWalkthrough() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    // Key is user-specific so every new account sees the guide
    const key = `ghostscribe_onboarding_seen_${user.id}`;
    const hasSeen = localStorage.getItem(key);

    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  const handleClose = () => {
    if (user?.id) {
      localStorage.setItem(`ghostscribe_onboarding_seen_${user.id}`, "true");
    }
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxHeight: "95vh", overflowY: "auto" }}
      >
        {/* Background glow blobs */}
        <div
          className={`absolute -top-16 -left-16 w-48 h-48 bg-gradient-to-br ${step.glow} blur-[80px] rounded-full pointer-events-none transition-all duration-700`}
        />
        <div
          className={`absolute -bottom-16 -right-16 w-48 h-48 bg-gradient-to-br ${step.glow} blur-[80px] rounded-full pointer-events-none transition-all duration-700`}
        />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all"
          aria-label="Skip guide"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10 p-6 sm:p-8">
          {/* Step counter */}
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-5">
            Step {currentStep + 1} of {STEPS.length}
          </p>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center shadow-lg`}
            >
              <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${step.iconColor}`} />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-3 leading-tight">
              {step.title}
            </h2>
            <p className="text-sm sm:text-base text-white/50 leading-relaxed mx-auto max-w-xs">
              {step.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentStep
                    ? "w-6 bg-white"
                    : i < currentStep
                      ? "w-3 bg-white/40"
                      : "w-3 bg-white/10"
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-all px-3 py-2 rounded-lg ${
                currentStep === 0
                  ? "opacity-0 pointer-events-none"
                  : "text-white/30 hover:text-white hover:bg-white/5"
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back
            </button>

            <button
              onClick={handleNext}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                isLast
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
              }`}
            >
              {isLast ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Get Started
                </>
              ) : (
                <>
                  Next <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Skip link */}
          {!isLast && (
            <button
              onClick={handleClose}
              className="w-full text-center text-[11px] text-white/20 hover:text-white/50 mt-4 transition-colors"
            >
              Skip tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
