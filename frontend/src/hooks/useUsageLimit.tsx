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
        .single();


      if (error) {
        if (error.code === "PGRST116") {
          // First time workspace usage row
          console.log('useUsageLimit: No usage record found, creating for workspace', activeWorkspace.id);
          const { data: newData, error: insertError } = await supabase
            .from("user_usage")
            .insert({ 
              workspace_id: activeWorkspace.id,
              clerk_user_id: user?.id,
              plan_name: 'Free',
              posts_limit: 10
            })
            .select()
            .single();


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


      if (error) {
        console.error("Error incrementing usage:", error);
        return;
      }
      setUsage(data);
    } catch (err) {
      console.error("Unexpected error in incrementUsage:", err);
    }
  }

  const hasTrialExpired = usage?.trial_start_at 
    ? (new Date().getTime() - new Date(usage.trial_start_at).getTime()) > TRIAL_DAYS * 24 * 60 * 60 * 1000
    : false;

  const canGenerate = usage?.posts_generated < usage?.posts_limit;
  const postsLeft = usage?.posts_limit - usage?.posts_generated;


  const trialDaysLeft = usage?.trial_start_at
    ? Math.max(0, TRIAL_DAYS - Math.floor((new Date().getTime() - new Date(usage.trial_start_at).getTime()) / (24 * 60 * 60 * 1000)))
    : TRIAL_DAYS;

  return { usage, loading, canGenerate, postsLeft, incrementUsage, hasTrialExpired, trialDaysLeft };
}
