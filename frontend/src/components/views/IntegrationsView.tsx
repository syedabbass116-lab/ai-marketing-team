import { useState, useEffect } from 'react';
import {
  Video,
  Linkedin,
  Calendar,
  Brain,
  Plus
} from 'lucide-react';
import { IntegrationStatus, ContentMemoryItem } from '../../types/engine';
import { fetchIntegrations, updateIntegration, fetchMemory } from '../../lib/engineApi';

interface IntegrationsViewProps {
  workspaceId?: string;
}

export default function IntegrationsView({ workspaceId = 'default' }: IntegrationsViewProps) {
  const [integrations, setIntegrations] = useState<Record<string, IntegrationStatus>>({});
  const [memories, setMemories] = useState<ContentMemoryItem[]>([]);

  // New Memory Modal State
  const [newOpinion, setNewOpinion] = useState('');
  const [newCategory, setNewCategory] = useState('opinion');
  const [addingMemory, setAddingMemory] = useState(false);

  useEffect(() => {
    async function load() {
      const [intData, memData] = await Promise.all([
        fetchIntegrations(workspaceId),
        fetchMemory(workspaceId)
      ]);
      setIntegrations(intData);
      setMemories(memData);
    }
    load();
  }, [workspaceId]);

  const toggleZoom = async () => {
    const isConn = integrations.zoom?.connected;
    const updated = await updateIntegration('zoom', { connected: !isConn }, workspaceId);
    setIntegrations(updated);
  };

  const toggleLinkedin = async () => {
    const isConn = integrations.linkedin?.connected;
    const updated = await updateIntegration('linkedin', { connected: !isConn }, workspaceId);
    setIntegrations(updated);
  };

  const handleAddMemory = () => {
    if (!newOpinion.trim()) return;
    setMemories((prev) => [
      {
        id: `m-${Date.now()}`,
        category: newCategory,
        key_point: newOpinion.trim()
      },
      ...prev
    ]);
    setNewOpinion('');
    setAddingMemory(false);
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-16">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">
            System Architecture & Integrations
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Integrations & Content Brain
        </h1>
        <p className="text-sm text-white/50 mt-1 max-w-2xl">
          Connect external recording sources and view the persistent memory layer that guides Ghostscribe's editorial decisions.
        </p>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Zoom Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0e0e11] p-6 flex flex-col justify-between hover:border-white/20 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/20 mb-4">
              <Video className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Zoom Meetings</h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  integrations.zoom?.connected
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-white/5 text-white/40'
                }`}
              >
                {integrations.zoom?.connected ? 'Connected' : 'Ready to Connect'}
              </span>
            </div>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Auto-ingest permitted meeting cloud recordings and transcripts directly into the Content Opportunity pipeline.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <button
              onClick={toggleZoom}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                integrations.zoom?.connected
                  ? 'bg-white/10 text-white hover:bg-white/15'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
              }`}
            >
              {integrations.zoom?.connected ? 'Disconnect Zoom' : 'Connect Zoom Account'}
            </button>
          </div>
        </div>

        {/* LinkedIn Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0e0e11] p-6 flex flex-col justify-between hover:border-white/20 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#0077b5]/20 text-[#0077b5] flex items-center justify-center border border-[#0077b5]/30 mb-4">
              <Linkedin className="w-5 h-5 fill-current" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">LinkedIn Publishing</h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  integrations.linkedin?.connected
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-white/5 text-white/40'
                }`}
              >
                {integrations.linkedin?.connected ? 'Active' : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              One-click publish and scheduling abstraction directly to your LinkedIn personal profile or company page.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <button
              onClick={toggleLinkedin}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                integrations.linkedin?.connected
                  ? 'bg-white/10 text-white hover:bg-white/15'
                  : 'bg-[#0077b5] hover:bg-[#006097] text-white shadow-lg shadow-[#0077b5]/20'
              }`}
            >
              {integrations.linkedin?.connected ? 'Manage LinkedIn' : 'Connect LinkedIn'}
            </button>
          </div>
        </div>

        {/* Google Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0e0e11] p-6 flex flex-col justify-between hover:border-white/20 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/20 mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Google Workspace</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/40">
                Ready to Connect
              </span>
            </div>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">
              Sync calendar discussions and permitted Google Meet notes into the Ghostscribe sources stream.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <button className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all">
              Connect Google
            </button>
          </div>
        </div>
      </div>

      {/* Content Brain / Personal Memory Layer */}
      <div className="rounded-3xl border border-white/10 bg-[#0e0e11] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Founder Content Brain & Memory</h2>
              <p className="text-xs text-white/50">
                Key opinions, customer problems, and recurring themes Ghostscribe has retained to avoid repetition.
              </p>
            </div>
          </div>

          <button
            onClick={() => setAddingMemory(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-bold transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory Point</span>
          </button>
        </div>

        {/* Add Memory Box */}
        {addingMemory && (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="opinion">Core Opinion</option>
                <option value="theme">Recurring Theme</option>
                <option value="customer_pain">Customer Pain Point</option>
                <option value="story">Personal Story</option>
              </select>
              <input
                type="text"
                value={newOpinion}
                onChange={(e) => setNewOpinion(e.target.value)}
                placeholder="e.g. 'We never charge hourly rates; value-based pricing only.'"
                className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAddingMemory(false)}
                className="px-3 py-1.5 text-xs text-white/50 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMemory}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Save to Brain
              </button>
            </div>
          </div>
        )}

        {/* Memories List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {memories.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all space-y-2"
            >
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white/50">
                {m.category.replace('_', ' ')}
              </span>
              <p className="text-xs text-white font-medium leading-relaxed">{m.key_point}</p>
              {m.source_ref && (
                <p className="text-[10px] text-white/30 truncate">Derived from: {m.source_ref}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
