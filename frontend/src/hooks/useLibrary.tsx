import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { supabase } from "../lib/supabase";

export type ContentItem = {
  id: string;
  platform: string;
  text: string;
  created_at: string;
  workspace_id?: string;
};

export function useLibrary() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [library, setLibrary] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLibrary = useCallback(async () => {
    if (!user?.id || !activeWorkspace?.id) {
      setLibrary([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    console.log("🔍 Fetching library for workspace:", activeWorkspace.id);
    try {
      const { data, error } = await supabase
        .from("content_library")
        .select("*")
        .eq("workspace_id", activeWorkspace.id);

      if (error) {
        console.error("❌ Supabase select error:", error);
        return;
      }
      setLibrary(data || []);
    } catch (err) {
      console.error("❌ Catch error during fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, activeWorkspace?.id]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  async function saveToLibrary(platform: string, text: string) {
    if (!user?.id || !activeWorkspace?.id) return;
    try {
      const { data, error } = await supabase
        .from("content_library")
        .insert([{ 
          user_id: user.id, 
          workspace_id: activeWorkspace.id,
          platform, 
          text 
        }])
        .select()
        .single();


      if (error) {
        console.error("❌ Supabase insert error:", error);
        throw error;
      }
      console.log("🚀 Save success, new record:", data);
      
      // Force refresh the whole library from DB to ensure sync
      await fetchLibrary();
      return data;
    } catch (err) {
      console.error("❌ Catch error during save:", err);
      throw err;
    }
  }

  async function deleteFromLibrary(id: string) {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from("content_library")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      setLibrary((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting:", err);
      throw err;
    }
  }

  return { library, loading, saveToLibrary, deleteFromLibrary, refreshLibrary: fetchLibrary };
}
