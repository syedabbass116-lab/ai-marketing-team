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
    if (!user?.id) {
      console.log('WorkspaceContext: No user ID yet, skipping fetch.');
      return;
    }
    setLoading(true);
    console.log('WorkspaceContext: Fetching workspaces for user', user.id);
    
    try {
      // 1. Get workspace IDs from members table
      const { data: memberData, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id);

      if (memberError) {
        console.error('WorkspaceContext: Error fetching members:', memberError);
        throw memberError;
      }
      
      console.log('WorkspaceContext: Member data found:', memberData);
      const wsIds = memberData?.map(m => m.workspace_id) || [];
      
      if (wsIds.length === 0) {
        console.log('WorkspaceContext: No workspaces found, creating default...');
        const workspaceName = user.email ? `${user.email.split('@')[0]}'s Workspace` : 'My Workspace';
        
        const { data: newWs, error: createError } = await supabase
          .from('workspaces')
          .insert([{ name: workspaceName, owner_id: user.id }])
          .select()
          .single();
        
        if (createError) {
          console.error('WorkspaceContext: Error creating default workspace:', createError);
          throw createError;
        }

        if (newWs) {
          console.log('WorkspaceContext: Default workspace created:', newWs.id);
          const { error: linkError } = await supabase
            .from('workspace_members')
            .insert([{ workspace_id: newWs.id, user_id: user.id, role: 'owner' }]);
          
          if (linkError) {
             console.error('WorkspaceContext: Error linking member to new workspace:', linkError);
          }

          setWorkspaces([newWs]);
          setActiveWorkspace(newWs);
        }
      } else {
        console.log('WorkspaceContext: Fetching workspace details for IDs:', wsIds);
        const { data: wsData, error: wsError } = await supabase
          .from('workspaces')
          .select('*')
          .in('id', wsIds);
        
        if (wsError) {
          console.error('WorkspaceContext: Error fetching workspace details:', wsError);
          throw wsError;
        }

        console.log('WorkspaceContext: Workspaces loaded:', wsData?.length);
        setWorkspaces(wsData || []);
        
        const savedWsId = localStorage.getItem('activeWorkspaceId');
        const savedWs = wsData?.find(w => w.id === savedWsId);
        setActiveWorkspace(savedWs || (wsData && wsData.length > 0 ? wsData[0] : null));
      }
    } catch (err) {
      console.error('WorkspaceContext: Critical error in fetchWorkspaces:', err);
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
