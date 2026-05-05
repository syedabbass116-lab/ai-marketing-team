import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Mail, Shield, Loader2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useWorkspace } from '../../context/WorkspaceContext';
import { supabase } from '../../lib/supabase';

export default function Team() {
  const { activeWorkspace } = useWorkspace();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const fetchMembers = async () => {
    if (!activeWorkspace?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', activeWorkspace.id);

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [activeWorkspace?.id]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeWorkspace) return;
    setInviting(true);
    try {
      // In this demo, we insert directly. In production, this would send an email.
      const { error } = await supabase
        .from('workspace_members')
        .insert([{
          workspace_id: activeWorkspace.id,
          user_id: inviteEmail.trim(), // Placeholder
          role: 'member'
        }]);

      if (error) throw error;
      setInviteEmail('');
      fetchMembers();
      alert(`Invitation sent to ${inviteEmail}`);
    } catch (err) {
      alert('Failed to invite user');
    } finally {
      setInviting(false);
    }
  };

  const removeMember = async (id: string) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setMembers(members.filter(m => m.id !== id));
    } catch (err) {
      alert('Failed to remove member');
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
          <h1 className="text-3xl font-bold text-white mb-1">Team Members</h1>
          <p className="text-sm text-white/40">Manage who has access to the {activeWorkspace?.name}</p>
        </div>
      </div>

      <Card className="border-white/20 bg-white/5">
        <h3 className="text-sm font-bold text-white mb-4">Invite New Member</h3>
        <form onSubmit={handleInvite} className="flex gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="email"
              required
              placeholder="colleague@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-white/30"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
            />
          </div>
          <Button 
            type="submit" 
            disabled={inviting}
            icon={<UserPlus className="w-4 h-4" />}
          >
            {inviting ? 'Inviting...' : 'Invite'}
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        {members.map((member) => (
          <Card key={member.id} className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white/40" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{member.user_id}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Shield className="w-3 h-3 text-white/30" />
                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                      {member.role}
                    </span>
                  </div>
                </div>
              </div>
              
              {member.role !== 'owner' && (
                <button 
                  onClick={() => removeMember(member.id)}
                  className="p-2 text-white/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
