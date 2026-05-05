import { Sparkles, ArrowRight, FolderOpen, Zap, Target, BookOpen } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { useUsageLimit } from "../../hooks/useUsageLimit";

type HomeProps = {
  onStartGenerate: () => void;
  onOpenLibrary: () => void;
};

export default function Home({ onStartGenerate, onOpenLibrary }: HomeProps) {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const { usage } = useUsageLimit(activeWorkspace?.id);
  
  const fullName = user?.user_metadata?.full_name || "";
  const firstName = fullName ? fullName.split(' ')[0] : (user?.email?.split('@')[0] || "there");
  const username = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const postsLeft = (usage?.posts_limit || 10) - (usage?.posts_generated || 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Greeting */}
      <div className="space-y-1">
        <h2 className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">{greeting}</h2>
        <h1 className="text-4xl font-black text-white tracking-tight">Welcome back, {username} 👋</h1>
      </div>

      {/* Usage Progress Section */}
      <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">Usage Analytics</p>
            <h3 className="text-2xl font-black text-white">Posts Generated This Month</h3>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-white">{usage?.posts_generated || 0}</span>
            <span className="text-white/30 font-bold ml-2">of {usage?.posts_limit || 10} available</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.5)]"
              style={{ width: `${Math.min(100, ((usage?.posts_generated || 0) / (usage?.posts_limit || 10)) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-blue-400">{Math.round(((usage?.posts_generated || 0) / (usage?.posts_limit || 10)) * 100)}% used</span>
            <span className="text-white/20">{postsLeft} posts remaining</span>
          </div>
        </div>
      </div>


      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex items-center gap-4 group hover:bg-white/[0.05] transition-all">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Posts Remaining</p>
            <h3 className="text-xl font-black text-white">{postsLeft} <span className="text-xs text-white/20 font-normal">/ {usage?.posts_limit || 10}</span></h3>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex items-center gap-4 group hover:bg-white/[0.05] transition-all">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 group-hover:scale-110 transition-transform">
            <Target className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Active Identity</p>
            <h3 className="text-xl font-black text-white truncate">{activeWorkspace?.name || "No Brand Selected"}</h3>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex items-center gap-4 group hover:bg-white/[0.05] transition-all">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Recent Drafts</p>
            <h3 className="text-xl font-black text-white">Manage Library</h3>
          </div>
        </div>
      </div>

      {/* Main Hero Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] px-10 py-16 text-center group">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
        
        <div className="relative max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-black tracking-[0.2em] uppercase">
            <Sparkles className="w-3 h-3 text-blue-400" />
            AI Content Engine Active
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tighter">
            Ready to scale your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">personal brand?</span>
          </h1>
          
          <p className="text-sm md:text-base text-white/40 max-w-lg mx-auto leading-relaxed font-medium px-4">
            Generate high-conversion posts tailored to your <span className="text-white">"{activeWorkspace?.name}"</span> identity in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center px-6">
            <Button
              variant="primary"
              size="lg"
              icon={<Sparkles className="w-5 h-5" />}
              onClick={onStartGenerate}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all font-black text-sm uppercase tracking-wider"
            >
              Generate New Post
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={onOpenLibrary}
              className="w-full sm:w-auto px-8 py-5 rounded-2xl border-white/5 hover:bg-white/5 transition-all font-bold text-sm"
            >
              View Saved Drafts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

