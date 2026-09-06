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
  const [readyQueue, setReadyQueue] = useState<EnginePost[]>([]);
  const [stats, setStats] = useState({
    ready_count: 1,
    week_count: 4,
    opportunities_count: 8,
    sources_count: 2
  });
  const [opportunities, setOpportunities] = useState<ContentOpportunity[]>([]);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [activeJob, setActiveJob] = useState<EngineJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const pollIntervalRef = useRef<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [todayData, oppsData, sourcesData] = await Promise.all([
        fetchTodaysPost(workspaceId),
        fetchOpportunities(workspaceId),
        fetchSources(workspaceId)
      ]);
      setTodaysPost(todayData.todays_post);
      setReadyQueue(todayData.ready_queue || []);
      setStats(todayData.stats || { ready_count: 1, week_count: 4, opportunities_count: 8, sources_count: 2 });
      setOpportunities(oppsData);
      setSources(sourcesData);
    } catch (err) {
      console.error('Error loading engine data:', err);
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
    setIsProcessing(true);
    setActiveJob({
      job_id: jobId,
      source_id: '',
      status: 'uploaded',
      progress_pct: 15,
      message: 'Analyzing your recording...'
    });

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = window.setInterval(async () => {
      try {
        const job = await pollJobStatus(jobId);
        setActiveJob(job);

        if (job.status === 'ready' || job.status === 'failed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setIsProcessing(false);

          if (job.status === 'ready' && job.result?.post) {
            setTodaysPost(job.result.post);
            loadData();
          }
        }
      } catch (e) {
        console.warn('Poll error:', e);
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
    }
  ) => {
    if (!todaysPost) return;

    // Optimistic UI updates
    if (action === 'approve') {
      setTodaysPost({ ...todaysPost, status: 'approved' });
    }

    try {
      const res = await executePostAction(
        todaysPost.id,
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
        setTodaysPost(res.post);
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
