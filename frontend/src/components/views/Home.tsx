import { FileText, Fingerprint, ArrowUpRight, PenTool, FolderOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useUsageLimit } from "../../hooks/useUsageLimit";
import logo from "../../assets/logo.png";

type HomeProps = {
  onViewChange?: (view: string) => void;
};

export default function Home({ onViewChange }: HomeProps) {
  const { user } = useAuth();
  const { workspaces, activeWorkspace } = useWorkspace();
  const { usage } = useUsageLimit(activeWorkspace?.id);
  
  const hasWorkspaces = workspaces && workspaces.length > 0;
  
  const fullName = user?.user_metadata?.full_name || "";
  const firstName = fullName ? fullName.split(' ')[0] : (user?.email?.split('@')[0] || "there");
  const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const postsGenerated = usage?.posts_generated || 0;
  const postsLimit = usage?.posts_limit || 10;
  const percentUsed = Math.min(100, (postsGenerated / postsLimit) * 100);

  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const fullText = "> Initializing Ghostwrites Engine...\n> Analyzing active Brand Identity...\n> Generating high-conversion hook...\n\nStop guessing what to post. The best creators build a system. Here is how I scaled my personal brand using AI to automate my thought leadership. 🚀";

  useEffect(() => {
    if (!isTyping) return;
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsTyping(false);
          setTimeout(() => {
            setTypedText("");
            setIsTyping(true);
          }, 1000);
        }, 5000);
      }
    }, 35);
    return () => clearInterval(interval);
  }, [isTyping, fullText]);

  return (
    <div className="min-h-screen bg-[#000] text-[#f0f0f0] font-sans selection:bg-[#f0f0f0] selection:text-[#000] pb-20 relative">
      {/* Subtle Background Grid */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)", 
          backgroundSize: "64px 64px" 
        }} 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000] to-[#000] pointer-events-none" />

      {/* Body (centered column) */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-28 px-4 animate-in fade-in duration-700 slide-in-from-bottom-4">
        <div className="text-center space-y-5 mb-14">
          <div className="relative inline-block mb-2">
            <div className="absolute inset-0 bg-white blur-[70px] opacity-[0.07] rounded-full" />
            <img src={logo} alt="Ghostwrites" className="relative w-20 h-20 object-contain mx-auto opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-[#888]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Hii {capitalizedFirstName}, what would you like to post today?
          </h1>
          <p className="text-sm md:text-base text-[#666] font-medium max-w-md mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Your content engine is fully operational. Select an action to begin crafting.
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-[500px]">
          
          {/* Card 1: Generate a post */}
          <button 
            onClick={() => onViewChange && onViewChange('generate')}
            className="group relative flex flex-col text-left p-6 bg-[#0a0a0a] hover:bg-[#111] border border-[#1f1f1f] hover:border-[#333] rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-2xl pointer-events-none" />
            <div className="flex items-center justify-between w-full mb-5 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#111] border border-[#252525] group-hover:border-[#2a2540] flex items-center justify-center transition-colors duration-300 shadow-inner">
                <PenTool className="w-5 h-5 text-[#888] group-hover:text-[#7F77DD] transition-colors duration-300" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#444] group-hover:text-[#888] transition-colors duration-300" />
            </div>
            
            <h3 className="text-lg font-semibold text-[#f0f0f0] mb-2 tracking-tight relative z-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Generate a post
            </h3>
            <p className="text-xs text-[#888] leading-relaxed relative z-10" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Turn any idea into a platform-ready draft instantly.
            </p>
          </button>

          {/* Card 2: Create brand identity */}
          <button 
            onClick={() => onViewChange && onViewChange('profile')}
            className="group relative flex flex-col text-left p-6 bg-[#0a0a0a] hover:bg-[#111] border border-[#1f1f1f] hover:border-[#333] rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-2xl pointer-events-none" />
            <div className="flex items-center justify-between w-full mb-5 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#111] border border-[#252525] group-hover:border-[#0f2035] flex items-center justify-center transition-colors duration-300 shadow-inner">
                <Fingerprint className="w-5 h-5 text-[#888] group-hover:text-[#378ADD] transition-colors duration-300" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#444] group-hover:text-[#888] transition-colors duration-300" />
            </div>
            
            <h3 className="text-lg font-semibold text-[#f0f0f0] mb-2 tracking-tight relative z-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Create brand identity
            </h3>
            <p className="text-xs text-[#888] leading-relaxed relative z-10" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Train your AI clone on your unique voice and tone.
            </p>
          </button>

        </div>

        {/* Context & Live Preview */}
        <div className="w-full max-w-[500px] mt-10 text-left">
          <div className="p-6 bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl flex flex-col gap-4 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#444] to-transparent opacity-50" />
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7F77DD] animate-pulse shadow-[0_0_8px_rgba(127,119,221,0.8)]" />
                <span className="text-[10px] font-bold text-[#888] tracking-widest uppercase" style={{ fontFamily: 'Poppins, sans-serif' }}>Live AI Engine</span>
              </div>
            </div>
            
            <p className="text-xs text-[#777] leading-relaxed mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Ghostwrites automatically structures your thoughts into platform-native posts.
            </p>

            <div className="bg-[#050505] border border-[#1a1a1a] rounded-xl font-mono text-xs text-[#888] h-[160px] overflow-hidden relative shadow-inner">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#1a1a1a] bg-[#0a0a0a]">
                 <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                 <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                 <div className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                 <span className="ml-2 text-[9px] uppercase tracking-widest text-[#555]">ai_engine.sh</span>
              </div>
              <div className="p-4">
                <span className="whitespace-pre-wrap leading-relaxed text-[#a0a0a0]">{typedText}</span>
                <span className="animate-pulse text-[#fff] ml-0.5">_</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider & Hint */}
        <div className="w-full max-w-[500px] mt-12 space-y-6">
          <div className="w-full h-px bg-[#1a1a1a]" />
          
          {!hasWorkspaces && (
            <p className="text-center text-xs text-[#2e2e2e]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              no brand voices yet — create one to unlock post generation
            </p>
          )}
        </div>

      </main>
    </div>
  );
}

