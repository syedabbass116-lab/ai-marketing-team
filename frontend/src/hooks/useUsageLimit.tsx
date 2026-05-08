import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { supabase } from "../lib/supabase";


const FREE_LIMIT = 3; // free posts per user
const TRIAL_DAYS = 7; // trial duration

export function useUsageLimit() {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeWorkspace?.id) {
      fetchUsage();
    }
  }, [activeWorkspace?.id]);

  async function fetchUsage() {
    if (!activeWorkspace?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('useUsageLimit: Fetching usage for workspace', activeWorkspace.id);
      let { data, error } = await supabase
        .from("user_usage")
        .select("*")
        .eq("workspace_id", activeWorkspace.id)
        .maybeSingle();

      if (error) {
        // Handle both standard PGRST116 (no rows) and 406 (Not Acceptable) which some configs return for empty .single()
        if (error.code === "PGRST116" || error.status === 406 || (error as any).message?.includes('406')) {
          // NEW USER/WORKSPACE: Initialize with FREE limits
          console.log('useUsageLimit: Initializing FREE plan for workspace', activeWorkspace.id);
          const { data: newData, error: insertError } = await supabase
            .from("user_usage")
            .insert({ 
              workspace_id: activeWorkspace.id,
              user_id: user?.id,
              plan_name: 'Free',
              posts_limit: 10,
              posts_generated: 0
            })
            .select()
            .maybeSingle();

          if (insertError) {
            console.error("Error creating user record:", insertError);
            setLoading(false);
            return;
          }
          data = newData;
        } else {
          console.error("Error fetching usage:", error);
          setLoading(false);
          return;
        }
      }

      setUsage(data);
    } catch (err) {
      console.error("Unexpected error in fetchUsage:", err);
    } finally {
      setLoading(false);
    }
  }

  async function incrementUsage() {
    if (!activeWorkspace?.id || !usage) return;
    try {
      const { data, error } = await supabase
        .from("user_usage")
        .update({ posts_generated: (usage.posts_generated || 0) + 1 })
        .eq("workspace_id", activeWorkspace.id)
        .select()
        .single();

      if (error) throw error;
      setUsage(data);
    } catch (err) {
      console.error("Error incrementing usage:", err);
    }
  }

  const canGenerate = (usage?.posts_generated || 0) < (usage?.posts_limit || 10);
  const postsLeft = Math.max(0, (usage?.posts_limit || 10) - (usage?.posts_generated || 0));

  // Dummy trial values to satisfy App.tsx destructuring
  const trialDaysLeft = 7;
  const hasTrialExpired = false;

  return { usage, loading, canGenerate, postsLeft, incrementUsage, refreshUsage: fetchUsage, trialDaysLeft, hasTrialExpired };
}

