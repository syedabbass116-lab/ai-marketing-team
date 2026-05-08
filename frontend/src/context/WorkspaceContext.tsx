import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface Workspace {
  id: string;
  name: string;
  plan: string;
  owner_id: string;
  logo_url?: string;
  profile_count?: number;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  loading: boolean;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace | null>;
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
      setLoading(false);
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
        
        // 2. Fetch profile counts for these workspaces
        const { data: profilesData } = await supabase
          .from('brand_settings')
          .select('workspace_id');
        
        const workspacesWithCount = (wsData || []).map(ws => ({
          ...ws,
          profile_count: profilesData?.filter(p => p.workspace_id === ws.id).length || 0
        }));

        setWorkspaces(workspacesWithCount);
        
        const savedWsId = localStorage.getItem('activeWorkspaceId');
        const savedWs = workspacesWithCount.find(w => w.id === savedWsId);
        setActiveWorkspace(savedWs || (workspacesWithCount.length > 0 ? workspacesWithCount[0] : null));
      }
    } catch (err) {
      console.error('WorkspaceContext: Critical error in fetchWorkspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (name: string): Promise<Workspace | null> => {
    if (!user?.id) return null;
    
    try {
      // 1. Create workspace
      const { data: newWs, error: createError } = await supabase
        .from('workspaces')
        .insert([{ name, owner_id: user.id }])
        .select()
        .single();
      
      if (createError) throw createError;

      if (newWs) {
        // 2. Link member
        const { error: linkError } = await supabase
          .from('workspace_members')
          .insert([{ workspace_id: newWs.id, user_id: user.id, role: 'owner' }]);
        
        if (linkError) throw linkError;

        await fetchWorkspaces();
        return newWs;
      }
      return null;
    } catch (err) {
      console.error('WorkspaceContext: createWorkspace failed:', err);
      throw err;
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
      refreshWorkspaces: fetchWorkspaces,
      createWorkspace
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
