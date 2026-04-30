import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase";

const FREE_LIMIT = 3; // free posts per user
const TRIAL_DAYS = 7; // trial duration

export function useUsageLimit() {
  const { user } = useUser();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchUsage();
  }, [user]);

  async function fetchUsage() {
    if (!user?.id) {
      console.error("User ID not available");
      setLoading(false);
      return;
    }

    try {
      let { data, error } = await supabase
        .from("user_usage")
        .select("*")
        .eq("clerk_user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // First time user — create their row
          const { data: newData, error: insertError } = await supabase
            .from("user_usage")
            .insert({ clerk_user_id: user.id })
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
    if (!user?.id || !usage) return;

    try {
      const { data, error } = await supabase
        .from("user_usage")
        .update({ posts_generated: usage.posts_generated + 1 })
        .eq("clerk_user_id", user.id)
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

  const canGenerate = usage?.is_pro || (!hasTrialExpired && usage?.posts_generated < FREE_LIMIT);
  const postsLeft = usage?.is_pro
    ? "∞"
    : hasTrialExpired ? 0 : Math.max(0, FREE_LIMIT - (usage?.posts_generated || 0));

  const trialDaysLeft = usage?.trial_start_at
    ? Math.max(0, TRIAL_DAYS - Math.floor((new Date().getTime() - new Date(usage.trial_start_at).getTime()) / (24 * 60 * 60 * 1000)))
    : TRIAL_DAYS;

  return { usage, loading, canGenerate, postsLeft, incrementUsage, hasTrialExpired, trialDaysLeft };
}
