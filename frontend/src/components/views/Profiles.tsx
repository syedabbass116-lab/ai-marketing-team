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
        is_active: profiles.length === 0
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Brand Profiles</h1>
          <p className="text-sm text-white/40">Manage your team's unique brand voices in {activeWorkspace?.name}</p>
        </div>
        <Button 
          icon={<Plus className="w-4 h-4" />} 
          onClick={() => setIsAdding(true)}
          disabled={!activeWorkspace}
        >
          New Profile
        </Button>
      </div>

      {isAdding && (
        <Card className="border-white/20 bg-white/5 max-w-4xl">
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-2">Profile Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Personal Brand, Tech Startup"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30"
                    value={newProfile.brand_name}
                    onChange={e => setNewProfile({...newProfile, brand_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-2">Voice</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30"
                    value={newProfile.brand_voice}
                    onChange={e => setNewProfile({...newProfile, brand_voice: e.target.value})}
                  >
                    {voiceOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-2">Tone</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30"
                    value={newProfile.tone}
                    onChange={e => setNewProfile({...newProfile, tone: e.target.value})}
                  >
                    {toneOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase mb-2">Description</label>
                  <input
                    type="text"
                    placeholder="Short summary of this brand"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30"
                    value={newProfile.brand_description}
                    onChange={e => setNewProfile({...newProfile, brand_description: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase mb-2">
                  <Target className="w-3 h-3" /> Target Audience
                </label>
                <textarea
                  placeholder="Who are we talking to?"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 h-20"
                  value={newProfile.target_audience}
                  onChange={e => setNewProfile({...newProfile, target_audience: e.target.value})}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase mb-2">
                  <PenTool className="w-3 h-3" /> Writing Styles (Paste Examples)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <textarea
                    placeholder="LinkedIn style..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 h-24"
                    value={newProfile.writing_style_linkedin}
                    onChange={e => setNewProfile({...newProfile, writing_style_linkedin: e.target.value})}
                  />
                  <textarea
                    placeholder="Twitter style..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 h-24"
                    value={newProfile.writing_style_twitter}
                    onChange={e => setNewProfile({...newProfile, writing_style_twitter: e.target.value})}
                  />
                  <textarea
                    placeholder="Threads style..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30 h-24"
                    value={newProfile.writing_style_threads}
                    onChange={e => setNewProfile({...newProfile, writing_style_threads: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase mb-2">
                  <Hash className="w-3 h-3" /> Key Topics
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI, Marketing, Personal Growth"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30"
                  value={newProfile.key_topics}
                  onChange={e => setNewProfile({...newProfile, key_topics: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit">Create Identity</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <Card 
            key={profile.id} 
            className={`transition-all ${profile.is_active ? 'border-white/40 ring-1 ring-white/20' : 'border-white/10 opacity-70 hover:opacity-100'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${profile.is_active ? 'bg-white/10' : 'bg-white/5'}`}>
                  <User className={`w-5 h-5 ${profile.is_active ? 'text-white' : 'text-white/40'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{profile.brand_name}</h3>
                  <div className="flex gap-2">
                    <span className="text-[9px] text-white/30 uppercase tracking-widest">{profile.brand_voice}</span>
                    <span className="text-[9px] text-white/30 uppercase tracking-widest">•</span>
                    <span className="text-[9px] text-white/30 uppercase tracking-widest">{profile.tone}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => !profile.is_active && setActiveProfile(profile.id)}
                className="focus:outline-none"
              >
                {profile.is_active ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <Circle className="w-5 h-5 text-white/10 hover:text-white/30" />
                )}
              </button>
            </div>
            
            <p className="text-xs text-white/50 mb-6 line-clamp-2 italic">
              {profile.brand_description || "No description provided."}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-6">
              {profile.key_topics?.split(',').map((topic, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-white/40">
                  {topic.trim()}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className={`text-[10px] font-bold tracking-tighter ${profile.is_active ? 'text-green-400' : 'text-white/20'}`}>
                {profile.is_active ? 'ACTIVE IDENTITY' : 'INACTIVE'}
              </span>
              <button 
                onClick={() => deleteProfile(profile.id)}
                className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}

        {profiles.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-xl">
            <User className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-1">No identities yet</h3>
            <p className="text-white/30 text-sm mb-6">Create your first brand identity to start generating content.</p>
            <Button onClick={() => setIsAdding(true)}>Create Identity</Button>
          </div>
        )}
      </div>
    </div>
  );
}
