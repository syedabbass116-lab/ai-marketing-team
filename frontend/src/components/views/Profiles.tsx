import { useState, useEffect } from 'react';
import { User, Plus, Trash2, CheckCircle2, Circle, Loader2, Info, Target, PenTool, Hash, Upload, Image as ImageIcon, AlertTriangle, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useBrandVoices, BrandProfile } from '../../hooks/useBrandVoices';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useUsageLimit } from '../../hooks/useUsageLimit';

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
  const { user } = useAuth();
  const { workspaces, createWorkspace, setActiveWorkspace, activeWorkspace, refreshWorkspaces } = useWorkspace();
  const { profiles, loading, addProfile, deleteProfile, setActiveProfile, refreshProfiles } = useBrandVoices(activeWorkspace?.id);
  const { usage } = useUsageLimit();
  const [globalProfiles, setGlobalProfiles] = useState<any[]>([]);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ profileId: string, workspaceId: string, name: string } | null>(null);
  const [deleteStep, setDeleteStep] = useState(0);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchGlobalCount = async () => {
    if (!user?.id) return;
    setGlobalLoading(true);
    const { data } = await supabase
      .from('brand_settings')
      .select('id')
      .eq('user_id', user.id);
    setGlobalProfiles(data || []);
    setGlobalLoading(false);

    const action = localStorage.getItem('profile_action');
    if (action === 'add') {
      setIsAdding(true);
      localStorage.removeItem('profile_action');
    }
  };

  useEffect(() => {
    fetchGlobalCount();
  }, [user?.id, isAdding]); 



  const [newProfile, setNewProfile] = useState<Partial<BrandProfile>>({
    brand_name: '',
    brand_description: '',
    brand_voice: 'professional',
    tone: 'friendly',
    target_audience: '',
    writing_style_linkedin: '',
    writing_style_twitter: '',
    writing_style_threads: '',
    key_topics: '',
    logo_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const filePath = `brand-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(filePath);

      setNewProfile({ ...newProfile, logo_url: publicUrl });
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert('Upload failed. Ensure "brand-assets" bucket exists and is public.');
    } finally {
      setUploading(false);
    }
  };

  const startEditing = (profile: BrandProfile) => {
    setNewProfile(profile);
    setEditingId(profile.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to manage identities.");
      return;
    }

    try {
      if (editingId) {
        // UPDATE FLOW
        const updateData = {
          brand_name: newProfile.brand_name,
          brand_description: newProfile.brand_description,
          brand_voice: newProfile.brand_voice,
          tone: newProfile.tone,
          target_audience: newProfile.target_audience,
          writing_style_linkedin: newProfile.writing_style_linkedin,
          writing_style_twitter: newProfile.writing_style_twitter,
          writing_style_threads: newProfile.writing_style_threads,
          key_topics: newProfile.key_topics,
          logo_url: newProfile.logo_url
        };

        const { error } = await supabase
          .from('brand_settings')
          .update(updateData)
          .eq('id', editingId);

        if (error) throw error;
        
        if (activeWorkspace) {
          await supabase
            .from('workspaces')
            .update({ 
              name: newProfile.brand_name,
              logo_url: newProfile.logo_url 
            })
            .eq('id', activeWorkspace.id);
        }

        showToast("Identity updated successfully!");
        refreshProfiles();
        refreshWorkspaces();
        setEditingId(null);
        setIsAdding(false);
      } else {
        // FINAL GLOBAL LIMIT CHECK
        if (isLimitReached) {
          showToast(`Limit reached for ${plan} plan (${PROFILE_LIMIT}). Upgrade to unlock more!`, "error");
          return;
        }

        // CREATE FLOW
        const workspaceName = newProfile.brand_name || "New Identity";
        let targetWsId = '';

        // AGGRESSIVE REUSE: If this is the user's first EVER brand profile in the active workspace, transform it
        if ((profiles?.length ?? 0) === 0) {
          const { error: wsUpdateErr } = await supabase
            .from('workspaces')
            .update({ 
              name: workspaceName,
              logo_url: newProfile.logo_url 
            })
            .eq('id', activeWorkspace?.id);
          
          if (wsUpdateErr) throw wsUpdateErr;
          targetWsId = activeWorkspace?.id || '';
        } else {
          const newWs = await createWorkspace(workspaceName);
          if (!newWs) throw new Error("Failed to initialize identity space.");
          targetWsId = newWs.id;

          if (newProfile.logo_url) {
            await supabase
              .from('workspaces')
              .update({ logo_url: newProfile.logo_url })
              .eq('id', newWs.id);
          }
        }

        const { error: profileErr } = await supabase
          .from('brand_settings')
          .insert([{
            brand_name: newProfile.brand_name,
            brand_description: newProfile.brand_description,
            brand_voice: newProfile.brand_voice,
            tone: newProfile.tone,
            target_audience: newProfile.target_audience,
            writing_style_linkedin: newProfile.writing_style_linkedin,
            writing_style_twitter: newProfile.writing_style_twitter,
            writing_style_threads: newProfile.writing_style_threads,
            key_topics: newProfile.key_topics,
            logo_url: newProfile.logo_url,
            workspace_id: targetWsId,
            user_id: user.id,
            created_by: user.email,
            is_active: true
          }]);

        if (profileErr) throw profileErr;

        showToast(`${workspaceName} created successfully!`);
        refreshProfiles();
        refreshWorkspaces();
        fetchGlobalCount();
        setIsAdding(false);
      }


      setIsAdding(false);
      setEditingId(null);
      setNewProfile({ 
        brand_name: '', brand_description: '', brand_voice: 'professional', tone: 'friendly',
        target_audience: '', writing_style_linkedin: '', writing_style_twitter: '', writing_style_threads: '', key_topics: '', logo_url: ''
      });
    } catch (err: any) {
      console.error('Operation failed:', err);
      alert(`Error: ${err.message || 'Unknown error'}`);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      // 1. Delete the brand profile
      const { error: profileErr } = await supabase
        .from('brand_settings')
        .delete()
        .eq('id', deleteTarget.profileId);
      
      if (profileErr) throw profileErr;

      // 2. Delete the workspace
      const { error: wsErr } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', deleteTarget.workspaceId);

      if (wsErr) throw wsErr;

      setDeleteTarget(null);
      setDeleteStep(0);
      showToast("Brand and Workspace deleted.");
      refreshProfiles();
      refreshWorkspaces();
      fetchGlobalCount();
    } catch (err: any) {
      console.error('Delete failed:', err);
      showToast(err.message, "error");
    }
  };





  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    );
  }

  const plan = usage?.plan_name || 'Free';
  const PROFILE_LIMIT = plan === 'Elite' ? 5 : plan === 'Pro' ? 3 : 1;
  const isLimitReached = (globalProfiles?.length ?? 0) >= PROFILE_LIMIT;

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Brand Identities</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full w-fit">
            <div className={`w-2 h-2 rounded-full ${isLimitReached ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
              {(globalProfiles?.length ?? 0)} / {PROFILE_LIMIT} Total Identities Used
            </span>
          </div>
        </div>
        {!isAdding && (
          <Button 
            icon={<Plus className="w-5 h-5" />} 
            onClick={() => setIsAdding(true)}
            disabled={globalLoading || isLimitReached}
            className={`shadow-xl transition-all duration-300 ${isLimitReached ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}
          >
            {isLimitReached ? "Account Limit Reached" : "Create New Identity"}
          </Button>
        )}
      </div>


      {isAdding && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            
            <form onSubmit={handleSubmit} className="p-2 space-y-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    {editingId ? <PenTool className="w-5 h-5 text-purple-400" /> : <User className="w-5 h-5" />}
                  </div>
                  {editingId ? 'Edit Brand Identity' : 'New Brand Identity'}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                  setNewProfile({ 
                    brand_name: '', brand_description: '', brand_voice: 'professional', tone: 'friendly',
                    target_audience: '', writing_style_linkedin: '', writing_style_twitter: '', writing_style_threads: '', key_topics: '', logo_url: ''
                  });
                }}>Cancel</Button>
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
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase mb-2 ml-1">Brand Picture</label>
                      <div className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-xl">
                        {newProfile.logo_url ? (
                          <div className="relative group">
                            <img src={newProfile.logo_url} alt="Logo" className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                            <button 
                              type="button"
                              onClick={() => setNewProfile({ ...newProfile, logo_url: '' })}
                              className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Plus className="w-3 h-3 text-white rotate-45" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-white/10" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <label className="cursor-pointer group">
                            <div className={`flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg group-hover:bg-white/10 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                              {uploading ? (
                                <Loader2 className="w-3 h-3 animate-spin text-white/40" />
                              ) : (
                                <Upload className="w-3 h-3 text-blue-400" />
                              )}
                              <span className="text-[10px] font-bold text-white/60">
                                {uploading ? 'Uploading...' : 'Choose Image'}
                              </span>
                            </div>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                      </div>
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
                    <div>
                      <label className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase mb-2 ml-1">
                        <PenTool className="w-3 h-3 text-pink-400" /> Threads Style
                      </label>
                      <textarea
                        placeholder="Paste a Threads example..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-pink-500/30 h-20 resize-none"
                        value={newProfile.writing_style_threads}
                        onChange={e => setNewProfile({...newProfile, writing_style_threads: e.target.value})}
                      />
                    </div>
                    <Button type="submit" className="w-full py-4 mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/20">
                      {editingId ? 'Update Identity' : 'Save New Identity'}
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
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => startEditing(profile)}
                    className="p-2.5 rounded-xl text-white/10 hover:text-purple-400 hover:bg-purple-400/5 transition-all duration-300"
                    title="Edit Identity"
                  >
                    <PenTool className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setDeleteTarget({ 
                        profileId: profile.id, 
                        workspaceId: profile.workspace_id, 
                        name: profile.brand_name 
                      });
                      setDeleteStep(1);
                    }}
                    className="p-2.5 rounded-xl text-white/10 hover:text-red-400 hover:bg-red-400/5 transition-all duration-300"
                    title="Delete Identity"
                  >


                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
              Your <span className="text-white">{plan}</span> plan includes <span className="text-white">{PROFILE_LIMIT}</span> Brand Identity. 
              Define your unique style to start generating high-conversion content.
            </p>
            <Button onClick={() => setIsAdding(true)} className="px-8 py-4 shadow-2xl shadow-purple-500/20 hover:scale-105 transition-all">
              Launch First Profile
            </Button>
          </div>
        )}
      </div>

      {/* DELETE MODAL UI */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => { setDeleteTarget(null); setDeleteStep(0); }}
          />
          
          <Card className="relative w-full max-w-sm sm:max-w-md bg-[#0a0a0a] border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden mx-auto">
            <div className={`absolute top-0 left-0 w-full h-1 ${deleteStep === 1 ? 'bg-amber-500' : 'bg-red-600'}`} />
            
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-2xl ${deleteStep === 1 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {deleteStep === 1 ? 'Confirm Deletion' : 'Critical Warning'}
                  </h3>
                  <p className="text-xs text-white/40 uppercase tracking-widest font-black mt-1">
                    {deleteStep === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {deleteStep === 1 ? (
                  <p className="text-white/60 leading-relaxed">
                    You are about to delete <span className="text-white font-bold">"{deleteTarget.name}"</span>. 
                    This will also permanently remove the associated workspace and all saved drafts.
                  </p>
                ) : (
                  <p className="text-white/60 leading-relaxed bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                    <span className="text-red-500 font-bold block mb-1">Final Warning:</span>
                    This action is <span className="text-white font-bold underline">permanent</span>. 
                    All brand DNA, writing styles, and settings will be wiped instantly.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {deleteStep === 1 ? (
                  <Button 
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white py-4"
                    onClick={() => setDeleteStep(2)}
                  >
                    I Understand, Continue
                  </Button>
                ) : (
                  <Button 
                    variant="ghost"
                    className="w-full bg-red-600 hover:bg-red-500 text-white py-4"
                    onClick={confirmDelete}
                  >
                    YES, DELETE EVERYTHING
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full text-white/40 hover:text-white"
                  onClick={() => { setDeleteTarget(null); setDeleteStep(0); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[2000] animate-in slide-in-from-bottom-4 duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-xl border shadow-2xl ${
            toast.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-500' 
              : 'bg-red-500/10 border-red-500/20 text-red-500'
          }`}>
            <div className={`p-1 rounded-full ${toast.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-50 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


