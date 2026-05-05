import { useState } from 'react';
import { User, Plus, Trash2, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useBrandVoices, BrandProfile } from '../../hooks/useBrandVoices';
import { useWorkspace } from '../../context/WorkspaceContext';


export default function Profiles() {
  const { activeWorkspace } = useWorkspace();
  const { profiles, loading, addProfile, deleteProfile, setActiveProfile } = useBrandVoices(activeWorkspace?.id);

  const [isAdding, setIsAdding] = useState(false);
  const [newProfile, setNewProfile] = useState({
    brand_name: '',
    brand_voice: '',
    tone: 'Professional'
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
        is_active: profiles.length === 0 // Set active if it's the first one
      });
      setIsAdding(false);
      setNewProfile({ brand_name: '', brand_voice: '', tone: 'Professional' });
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
          <p className="text-sm text-white/40">Manage your different brand identities and voices</p>
        </div>
        <Button 
          icon={<Plus className="w-4 h-4" />} 
          onClick={() => setIsAdding(true)}
        >
          New Profile
        </Button>
      </div>

      {isAdding && (
        <Card className="border-white/20 bg-white/5">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-xs font-bold text-white/40 uppercase mb-2">Tone</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30"
                  value={newProfile.tone}
                  onChange={e => setNewProfile({...newProfile, tone: e.target.value})}
                >
                  <option value="Professional">Professional</option>
                  <option value="Witty">Witty</option>
                  <option value="Inspirational">Inspirational</option>
                  <option value="Direct">Direct</option>
                  <option value="Conversational">Conversational</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/40 uppercase mb-2">Writing Style / Voice Description</label>
              <textarea
                required
                placeholder="Describe how this brand speaks (e.g. 'Short sentences, punchy hooks, use industry jargon sparingly')"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 h-24"
                value={newProfile.brand_voice}
                onChange={e => setNewProfile({...newProfile, brand_voice: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit">Create Profile</Button>
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
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">{profile.tone}</span>
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
            
            <p className="text-xs text-white/50 mb-6 line-clamp-3 italic">
              "{profile.brand_voice}"
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className={`text-[10px] font-bold tracking-tighter ${profile.is_active ? 'text-green-400' : 'text-white/20'}`}>
                {profile.is_active ? 'ACTIVE VOICE' : 'INACTIVE'}
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
            <h3 className="text-white font-medium mb-1">No profiles yet</h3>
            <p className="text-white/30 text-sm mb-6">Create your first brand profile to start generating content.</p>
            <Button onClick={() => setIsAdding(true)}>Create Profile</Button>
          </div>
        )}
      </div>
    </div>
  );
}
