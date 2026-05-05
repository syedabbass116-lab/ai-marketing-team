import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface Workspace {
  id: string;
  name: string;
  plan: string;
  owner_id: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  loading: boolean;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // 1. Get workspace IDs from members table
      const { data: memberData, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;
      
      const wsIds = memberData.map(m => m.workspace_id);
      if (wsIds.length === 0) {
        // Fallback: Check if user has an old record we can convert, or create a default one
        const { data: newWs, error: createError } = await supabase
          .from('workspaces')
          .insert([{ name: `${user.email?.split('@')[0]}'s Workspace`, owner_id: user.id }])
          .select()
          .single();
        
        if (!createError && newWs) {
          await supabase.from('workspace_members').insert([{ workspace_id: newWs.id, user_id: user.id, role: 'owner' }]);
          setWorkspaces([newWs]);
          setActiveWorkspace(newWs);
        }
      } else {
        const { data: wsData, error: wsError } = await supabase
          .from('workspaces')
          .select('*')
          .in('id', wsIds);
        
        if (wsError) throw wsError;
        setWorkspaces(wsData || []);
        
        // Auto-select first workspace or previously selected one from localStorage
        const savedWsId = localStorage.getItem('activeWorkspaceId');
        const savedWs = wsData?.find(w => w.id === savedWsId);
        setActiveWorkspace(savedWs || (wsData ? wsData[0] : null));
      }
    } catch (err) {
      console.error('Error fetching workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user?.id]);

  useEffect(() => {
    if (activeWorkspace) {
      localStorage.setItem('activeWorkspaceId', activeWorkspace.id);
    }
  }, [activeWorkspace]);

  return (
    <WorkspaceContext.Provider value={{ 
      workspaces, 
      activeWorkspace, 
      setActiveWorkspace, 
      loading,
      refreshWorkspaces: fetchWorkspaces 
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
