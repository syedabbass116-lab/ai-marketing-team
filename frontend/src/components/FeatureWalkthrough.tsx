import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  User, 
  Layout, 
  Library, 
  Calendar, 
  ArrowRight, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';

const STEPS = [
  {
    title: "Welcome to Ghostwrites",
    description: "The world's most powerful AI content engine for professional ghostwriters and brand owners.",
    icon: <Sparkles className="w-12 h-12 text-blue-400" />,
    color: "from-blue-500/20 to-purple-500/20"
  },
  {
    title: "Define Your DNA",
    description: "Create multiple 'Brand Identities' to switch between different voices, tones, and target audiences instantly.",
    icon: <User className="w-12 h-12 text-purple-400" />,
    color: "from-purple-500/20 to-pink-500/20"
  },
  {
    title: "The AI Command Center",
    description: "Generate high-conversion posts for LinkedIn, Twitter, and Threads using natural language commands.",
    icon: <Layout className="w-12 h-12 text-pink-400" />,
    color: "from-pink-500/20 to-orange-500/20"
  },
  {
    title: "Your Private Library",
    description: "Save your favorite generations to your personal library for future use or repurposing.",
    icon: <Library className="w-12 h-12 text-orange-400" />,
    color: "from-orange-500/20 to-yellow-500/20"
  },
  {
    title: "Smart Scheduling",
    description: "Schedule your content directly to your social platforms via our professional Zapier integration.",
    icon: <Calendar className="w-12 h-12 text-emerald-400" />,
    color: "from-emerald-500/20 to-teal-500/20"
  }
];

export default function FeatureWalkthrough() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem('ghostwrites_onboarding_seen');
    if (!hasSeen) {
      // Delay slightly for better UX
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('ghostwrites_onboarding_seen', 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all duration-500">
      <Card className="relative w-full max-w-xl bg-[#0a0a0a] border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Animated Background Glow */}
        <div className={`absolute -top-24 -left-24 w-64 h-64 bg-gradient-to-br ${step.color} blur-[100px] rounded-full transition-all duration-1000 opacity-50`} />
        <div className={`absolute -bottom-24 -right-24 w-64 h-64 bg-gradient-to-br ${step.color} blur-[100px] rounded-full transition-all duration-1000 opacity-50`} />

        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 sm:p-12 relative z-10">
          {/* Icon Section */}
          <div className="mb-10 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl opacity-20 bg-white rounded-full animate-pulse" />
              <div className="relative bg-white/5 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl">
                {step.icon}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-black text-white tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-500">
              {step.title}
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
              {step.description}
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-10">
            {STEPS.map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === currentStep ? 'w-8 bg-white' : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            <button 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-all ${
                currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-white/40 hover:text-white'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <Button 
              onClick={handleNext}
              className="px-10 py-4 shadow-2xl shadow-blue-500/20 flex items-center gap-2 group"
            >
              {currentStep === STEPS.length - 1 ? (
                <>Get Started <CheckCircle2 className="w-4 h-4" /></>
              ) : (
                <>Next Step <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
