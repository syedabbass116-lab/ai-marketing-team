import { useState } from 'react';
import { User, Plus, Trash2, CheckCircle2, Circle, Loader2, Info, Target, PenTool, Hash } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useBrandVoices, BrandProfile } from '../../hooks/useBrandVoices';
import { useWorkspace } from '../../context/WorkspaceContext';

const voiceOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "bold", label: "Bold" },
  { value: "inspirational", label: "Inspirational" },
  { value: "humorous", label: "Humorous" },
];

const toneOptions = [
  { value: "friendly", label: "Friendly" },
  { value: "authoritative", label: "Authoritative" },
  { value: "empathetic", label: "Empathetic" },
  { value: "educational", label: "Educational" },
];

export default function Profiles() {
  const { activeWorkspace } = useWorkspace();
  const { profiles, loading, addProfile, deleteProfile, setActiveProfile } = useBrandVoices(activeWorkspace?.id);
  const [isAdding, setIsAdding] = useState(false);
  const [newProfile, setNewProfile] = useState<Partial<BrandProfile>>({
    brand_name: '',
    brand_description: '',
    brand_voice: 'professional',
    tone: 'friendly',
    target_audience: '',
    writing_style_linkedin: '',
    writing_style_twitter: '',
    writing_style_threads: '',
    key_topics: ''
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) {
      alert('Please select or create a workspace first using the switcher in the sidebar.');
      return;
    }
    try {
      await addProfile({
        ...newProfile,
        is_active: (profiles?.length ?? 0) === 0
      });

      setIsAdding(false);
      setNewProfile({ 
        brand_name: '', brand_description: '', brand_voice: 'professional', tone: 'friendly',
        target_audience: '', writing_style_linkedin: '', writing_style_twitter: '', writing_style_threads: '', key_topics: ''
      });
    } catch (err: any) {
      console.error('Failed to add profile:', err);
      alert(`Failed to add profile: ${err.message || 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    );
  }

  const PROFILE_LIMIT = 5;
  const isLimitReached = (profiles?.length ?? 0) >= PROFILE_LIMIT;

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Brand Identities</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full w-fit">
            <div className={`w-2 h-2 rounded-full ${isLimitReached ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
              {(profiles?.length ?? 0)} / {PROFILE_LIMIT} Slots Used
            </span>
          </div>
        </div>
        {!isAdding && (
          <Button 
            icon={<Plus className="w-5 h-5" />} 
            onClick={() => setIsAdding(true)}
            disabled={!activeWorkspace || isLimitReached}
            className={`shadow-xl transition-all duration-300 ${isLimitReached ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}
          >
            {isLimitReached ? "Identity Limit Reached" : "Create New Identity"}
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            
            <form onSubmit={handleAdd} className="p-2 space-y-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <div className="p-1.5 bg-white/10 rounded-lg"><User className="w-5 h-5" /></div>
                  New Brand Identity
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Column 1: Core Identity */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">1. Core DNA</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase mb-2 ml-1">Identity Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CEO Personal Brand"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                        value={newProfile.brand_name}
                        onChange={e => setNewProfile({...newProfile, brand_name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase mb-2 ml-1">Voice</label>
                        <select
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                          value={newProfile.brand_voice}
                          onChange={e => setNewProfile({...newProfile, brand_voice: e.target.value})}
                        >
                          {voiceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase mb-2 ml-1">Tone</label>
                        <select
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                          value={newProfile.tone}
                          onChange={e => setNewProfile({...newProfile, tone: e.target.value})}
                        >
                          {toneOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase mb-2 ml-1">Key Topics</label>
                      <input
                        type="text"
                        placeholder="SaaS, AI, Productivity"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                        value={newProfile.key_topics}
                        onChange={e => setNewProfile({...newProfile, key_topics: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Column 2: Strategy */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">2. Strategic Context</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase mb-2 ml-1">Brand Description</label>
                      <textarea
                        placeholder="What is this brand about?"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all h-24 resize-none"
                        value={newProfile.brand_description}
                        onChange={e => setNewProfile({...newProfile, brand_description: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase mb-2 ml-1">Target Audience</label>
                      <textarea
                        placeholder="Who are we speaking to?"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all h-28 resize-none"
                        value={newProfile.target_audience}
                        onChange={e => setNewProfile({...newProfile, target_audience: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Column 3: Writing DNA */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">3. Writing DNA</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase mb-2 ml-1">
                        <PenTool className="w-3 h-3 text-blue-400" /> LinkedIn Style
                      </label>
                      <textarea
                        placeholder="Paste a LinkedIn post example..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/30 h-20 resize-none"
                        value={newProfile.writing_style_linkedin}
                        onChange={e => setNewProfile({...newProfile, writing_style_linkedin: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase mb-2 ml-1">
                        <PenTool className="w-3 h-3 text-sky-400" /> Twitter Style
                      </label>
                      <textarea
                        placeholder="Paste a Twitter thread example..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/30 h-20 resize-none"
                        value={newProfile.writing_style_twitter}
                        onChange={e => setNewProfile({...newProfile, writing_style_twitter: e.target.value})}
                      />
                    </div>
                    <Button type="submit" className="w-full py-4 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/20">
                      Save New Identity
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {profiles.map((profile) => (
          <div 
            key={profile.id}
            className={`group relative transition-all duration-500 hover:-translate-y-2 ${profile.is_active ? 'scale-100' : 'scale-[0.98] opacity-80 hover:opacity-100'}`}
          >
            {profile.is_active && (
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse" />
            )}
            
            <Card className={`relative h-full bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col ${profile.is_active ? 'border-white/20 shadow-2xl' : ''}`}>
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${profile.is_active ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20' : 'bg-white/5'}`}>
                    <User className={`w-6 h-6 ${profile.is_active ? 'text-white' : 'text-white/40'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">
                      {profile.brand_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-white/40 uppercase tracking-widest">{profile.brand_voice}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-white/40 uppercase tracking-widest">{profile.tone}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => !profile.is_active && setActiveProfile(profile.id)}
                  className={`transition-all duration-300 ${profile.is_active ? 'cursor-default' : 'hover:scale-125'}`}
                >
                  {profile.is_active ? (
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">Live</span>
                    </div>
                  ) : (
                    <Circle className="w-6 h-6 text-white/10 hover:text-white/40" />
                  )}
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-white/40 mb-8 line-clamp-3 leading-relaxed italic flex-grow">
                "{profile.brand_description || "Defining a new standard for this brand identity."}"
              </p>

              {/* Topics Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {profile.key_topics?.split(',').slice(0, 3).map((topic, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                    <Hash className="w-3 h-3 text-white/20" />
                    <span className="text-[10px] font-bold text-white/60">{topic.trim()}</span>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Strategy</span>
                    <span className="text-[10px] font-bold text-white/60">
                      {profile.target_audience ? 'Custom Audience' : 'General'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => deleteProfile(profile.id)}
                  className="p-2.5 rounded-xl text-white/10 hover:text-red-400 hover:bg-red-400/5 transition-all duration-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          </div>
        ))}

        {profiles.length === 0 && !isAdding && (
          <div className="col-span-full py-24 text-center bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[3rem] group hover:bg-white/[0.03] transition-all duration-500">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <User className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Initialize Your Identity</h3>
            <p className="text-white/30 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Every great content strategy starts with a defined voice. Create your first brand profile to train Ghostwrites on your unique style.
            </p>
            <Button onClick={() => setIsAdding(true)} className="px-8 py-4 shadow-2xl shadow-purple-500/20 hover:scale-105 transition-all">
              Launch First Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
