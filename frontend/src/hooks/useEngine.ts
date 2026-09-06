import { useState, useEffect, useCallback, useRef } from 'react';
import {
  EnginePost,
  ContentOpportunity,
  SourceItem,
  EngineJob,
  SourceType
} from '../types/engine';
import {
  fetchTodaysPost,
  uploadAudioCapture,
  submitQuickThought,
  pollJobStatus,
  executePostAction,
  fetchOpportunities,
  generateFromOpportunity,
  fetchSources,
  deleteSource
} from '../lib/engineApi';

export function useEngine(workspaceId = 'default') {
  const [todaysPost, setTodaysPost] = useState<EnginePost | null>(null);
  const [todaysPosts, setTodaysPosts] = useState<EnginePost[]>([]);
  const [readyQueue, setReadyQueue] = useState<EnginePost[]>([]);
  const [stats, setStats] = useState({
    ready_count: 0,
    week_count: 0,
    opportunities_count: 0,
    sources_count: 0
  });
  const [opportunities, setOpportunities] = useState<ContentOpportunity[]>([]);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [activeJob, setActiveJob] = useState<EngineJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const pollIntervalRef = useRef<number | null>(null);
  // Track the active recording so we never apply results from a stale job
  const currentJobIdRef = useRef<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [todayData, oppsData, sourcesData] = await Promise.all([
        fetchTodaysPost(workspaceId),
        fetchOpportunities(workspaceId),
        fetchSources(workspaceId)
      ]);
      const mainPost = todayData.todays_post;
      const queue = todayData.ready_queue || [];
      setTodaysPost(mainPost);
      setReadyQueue(queue);

      if (mainPost) {
        // Group posts generated from same session if available
        const related = queue.filter(q => q.source_id && q.source_id === mainPost.source_id);
        setTodaysPosts([mainPost, ...related]);
      } else {
        setTodaysPosts([]);
      }

      setStats(todayData.stats || { ready_count: 0, week_count: 0, opportunities_count: 0, sources_count: 0 });
      setOpportunities(oppsData);
      setSources(sourcesData);
    } catch (err) {
      console.error('[GhostScribe] Error loading engine data:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadData();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [loadData]);

  // Start polling a background job
  const startJobPolling = (jobId: string) => {
    // Record which job is active — ignore results from any older job
    currentJobIdRef.current = jobId;
    setIsProcessing(true);

    // Reset stale post state so the user never sees content from a previous recording
    setTodaysPost(null);
    setTodaysPosts([]);

    setActiveJob({
      job_id: jobId,
      source_id: '',
      status: 'uploaded',
      progress_pct: 15,
      message: 'Analyzing your recording...'
    });

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    if (import.meta.env.DEV) {
      console.log(`[GhostScribe] Polling started — jobId: ${jobId}`);
    }

    pollIntervalRef.current = window.setInterval(async () => {
      // Abort if this is no longer the active job
      if (currentJobIdRef.current !== jobId) {
        clearInterval(pollIntervalRef.current!);
        pollIntervalRef.current = null;
        return;
      }

      try {
        const job = await pollJobStatus(jobId);
        setActiveJob(job);

        if (import.meta.env.DEV) {
          console.log(
            `[GhostScribe] Poll — jobId: ${jobId}, status: ${job.status}, ` +
            `progress: ${job.progress_pct}%` +
            (job.result?.transcript_chars != null
              ? `, transcript_chars: ${job.result.transcript_chars}`
              : '')
          );
        }

        if (job.status === 'ready' || job.status === 'failed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setIsProcessing(false);

          if (job.status === 'ready' && job.result) {
            if (currentJobIdRef.current === jobId) {
              const allGenerated = job.result.posts && job.result.posts.length > 0
                ? job.result.posts
                : (job.result.post ? [job.result.post] : []);

              if (allGenerated.length > 0) {
                setTodaysPost(allGenerated[0]);
                setTodaysPosts(allGenerated);
              }
              loadData();
            }
          } else if (job.status === 'failed') {
            console.error(`[GhostScribe] Job failed — jobId: ${jobId}, message: ${job.message}`);
          }
        }
      } catch (e) {
        // Poll error — backend might be starting up. Log but keep polling.
        console.warn(`[GhostScribe] Poll error for jobId ${jobId}:`, e);
      }
    }, 1800);
  };

  const submitAudio = async (
    audioBlob: Blob,
    title?: string,
    sourceType: SourceType = 'recording',
    brandName?: string,
    targetAudience?: string
  ) => {
    try {
      const formData = new FormData();
      const ext = audioBlob.type.includes('mp4') ? 'mp4' : (audioBlob.type.includes('wav') ? 'wav' : 'webm');
      formData.append('file', audioBlob, `capture_${Date.now()}.${ext}`);
      formData.append('source_type', sourceType);
      formData.append('workspace_id', workspaceId);
      if (title) formData.append('title', title);
      if (brandName) formData.append('brand_name', brandName);
      if (targetAudience) formData.append('target_audience', targetAudience);

      const res = await uploadAudioCapture(formData);
      if (res.job_id) {
        startJobPolling(res.job_id);
      }
      return res;
    } catch (err) {
      console.error('submitAudio failed:', err);
      throw err;
    }
  };

  const submitThought = async (text: string, title?: string) => {
    try {
      const res = await submitQuickThought({
        text,
        workspace_id: workspaceId,
        title
      });
      if (res.job_id) {
        startJobPolling(res.job_id);
      }
      return res;
    } catch (err) {
      console.error('submitThought failed:', err);
      throw err;
    }
  };

  const handlePostAction = async (
    action: 'approve' | 'edit' | 'regenerate' | 'copy' | 'schedule',
    options?: {
      modifier?: string;
      customInstruction?: string;
      scheduledAt?: string;
      content?: string;
    },
    targetPost?: EnginePost
  ) => {
    const postToUse = targetPost || todaysPost;
    if (!postToUse) return;

    // Optimistic UI updates
    if (action === 'approve') {
      const updated = { ...postToUse, status: 'approved' as const };
      if (todaysPost?.id === postToUse.id) setTodaysPost(updated);
      setTodaysPosts(prev => prev.map(p => p.id === postToUse.id ? updated : p));
    }

    try {
      const res = await executePostAction(
        postToUse.id,
        {
          action,
          modifier: options?.modifier,
          custom_instruction: options?.customInstruction,
          scheduled_at: options?.scheduledAt,
          content: options?.content
        },
        workspaceId
      );

      if (res.post) {
        const updatedPost = res.post;
        if (todaysPost?.id === postToUse.id) setTodaysPost(updatedPost);
        setTodaysPosts(prev => prev.map(p => p.id === postToUse.id ? updatedPost : p));
      }
      return res;
    } catch (err) {
      console.error('Post action error:', err);
      throw err;
    }
  };

  const handleOpportunityGenerate = async (oppId: string, angle?: string) => {
    try {
      const newPost = await generateFromOpportunity(oppId, { angle }, workspaceId);
      setTodaysPost(newPost);
      setReadyQueue((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      console.error('Generate from opp error:', err);
      throw err;
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      const ok = await deleteSource(sourceId, workspaceId);
      if (ok) {
        setSources((prev) => prev.filter((s) => s.id !== sourceId));
        setOpportunities((prev) => prev.filter((o) => o.source_id !== sourceId));
      }
      return ok;
    } catch (err) {
      console.error('Delete source error:', err);
      throw err;
    }
  };

  const dismissJob = () => {
    setActiveJob(null);
    setIsProcessing(false);
  };

  return {
    todaysPost,
    todaysPosts,
    readyQueue,
    stats,
    opportunities,
    sources,
    activeJob,
    isProcessing,
    loading,
    submitAudio,
    submitThought,
    handlePostAction,
    handleOpportunityGenerate,
    handleDeleteSource,
    dismissJob,
    refreshEngine: loadData
  };
}
