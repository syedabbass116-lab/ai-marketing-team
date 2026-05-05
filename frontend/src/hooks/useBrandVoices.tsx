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

export function useBrandVoices() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('brand_settings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const addProfile = async (profile: Partial<BrandProfile>) => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('brand_settings')
        .insert([{ ...profile, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
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
