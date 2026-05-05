import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export interface BrandProfile {
  id: string;
  brand_name: string;
  brand_voice: string;
  tone: string;
  is_active: boolean;
  created_at: string;
}

export function useBrandVoices(workspaceId?: string) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    console.log('useBrandVoices: Fetching profiles for workspace', workspaceId);
    try {
      const { data, error } = await supabase
        .from('brand_settings')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useBrandVoices: Fetch error:', error);
        throw error;
      }
      console.log('useBrandVoices: Profiles loaded:', data?.length);
      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const addProfile = async (profile: Partial<BrandProfile>) => {
    if (!workspaceId) {
      throw new Error("No active workspace selected. Please select a workspace in the sidebar first.");
    }
    if (!user?.id) {
      throw new Error("User session not found. Please log in again.");
    }
    
    console.log('useBrandVoices: Attempting to add profile', { ...profile, workspace_id: workspaceId });
    
    try {
      const payload = { ...profile, workspace_id: workspaceId, created_by: user.id };
      const { data, error } = await supabase
        .from('brand_settings')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('useBrandVoices: Add error details:', error);
        throw error;
      }
      
      console.log('useBrandVoices: Profile added successfully:', data);
      setProfiles([data, ...profiles]);
      return data;
    } catch (err) {
      console.error('Error adding profile:', err);
      throw err;
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      const { error } = await supabase
        .from('brand_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProfiles(profiles.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting profile:', err);
      throw err;
    }
  };

  const setActiveProfile = async (id: string) => {
    if (!user?.id) return;
    try {
      // The DB trigger handles setting others to false, but we'll update local state
      const { error } = await supabase
        .from('brand_settings')
        .update({ is_active: true })
        .eq('id', id);

      if (error) throw error;
      
      setProfiles(profiles.map(p => ({
        ...p,
        is_active: p.id === id
      })));
    } catch (err) {
      console.error('Error setting active profile:', err);
      throw err;
    }
  };

  return { profiles, loading, addProfile, deleteProfile, setActiveProfile, refreshProfiles: fetchProfiles };
}
