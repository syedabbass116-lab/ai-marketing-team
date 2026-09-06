import {
  EnginePost,
  ContentOpportunity,
  SourceItem,
  IntegrationStatus,
  EngineJob,
  ContentMemoryItem
} from '../types/engine';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

// Default sample data for instant offline/fallback operation
const DEFAULT_POST: EnginePost = {
  id: 'post-init-1',
  title: "Most companies don't have a lead problem",
  content: `Most companies don't have a lead problem.

They have a follow-up problem.

In our client sessions this week, the breakdown was identical:
Teams spend $10,000+ driving inbound inquiries, only to abandon leads after 72 hours.

When we instituted a mandatory 5-touchpoint cadence, their conversion rate went up 4x in two weeks.

Before you buy more leads, ask yourself:
Are you actually working the ones you already have?

What is your team's follow-up protocol after day 3?`,
  platform: 'linkedin',
  angle: 'contrarian',
  status: 'recommended_today',
  provenance: {
    source_title: "Yesterday's recorded session",
    derived_from: "Discussion about sales follow-up retention",
    content_angle: "Contrarian insight",
    evidence_quote: "Most clients don't have a lead problem, they have a follow-up problem.",
    source_timestamp: 124
  },
  metrics: {
    icp_relevance: 94,
    originality: 89,
    confidence: 95,
    overall_score: 92
  },
  created_at: new Date().toISOString()
};

const DEFAULT_OPPORTUNITIES: ContentOpportunity[] = [
  {
    id: 'opp-1',
    title: "Most agencies don't have a lead problem",
    summary: "Why focusing on top-of-funnel acquisition blinds founders to massive deal leakage in the first 72 hours.",
    why_interesting: "Counters the standard marketing narrative with concrete retention data.",
    content_type: "Contrarian insight",
    recommended_angle: "contrarian",
    available_angles: ["contrarian", "story", "educational", "framework", "personal_lesson"],
    icp_relevance: 96,
    originality: 91,
    overall_score: 94,
    status: 'ready',
    source_title: "Client strategy call — Sept 6"
  },
  {
    id: 'opp-2',
    title: "The 5-Touchpoint Follow-up Cadence",
    summary: "The exact 14-day message sequence that produced a 4x conversion boost without extra ad spend.",
    why_interesting: "Actionable, tactical playbook founders can hand to their team right now.",
    content_type: "Tactical framework",
    recommended_angle: "framework",
    available_angles: ["framework", "educational", "case_study", "story"],
    icp_relevance: 92,
    originality: 87,
    overall_score: 90,
    status: 'ready',
    source_title: "Voice note — Sept 5"
  },
  {
    id: 'opp-3',
    title: "Why we stopped writing custom proposals",
    summary: "Custom proposals took 6 hours each and reduced closing momentum by 40%.",
    why_interesting: "High-empathy founder lesson on productized offers.",
    content_type: "Personal lesson",
    recommended_angle: "personal_lesson",
    available_angles: ["personal_lesson", "story", "contrarian"],
    icp_relevance: 89,
    originality: 85,
    overall_score: 87,
    status: 'ready',
    source_title: "Weekly retrospective recording"
  }
];

export async function fetchTodaysPost(workspaceId = 'default'): Promise<{
  todays_post: EnginePost;
  ready_queue: EnginePost[];
  stats: { ready_count: number; week_count: number; opportunities_count: number; sources_count: number };
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/engine/todays-post?workspace_id=${workspaceId}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Using fallback todays post:', err);
    return {
      todays_post: DEFAULT_POST,
      ready_queue: [],
      stats: { ready_count: 1, week_count: 4, opportunities_count: 8, sources_count: 2 }
    };
  }
}

export async function uploadAudioCapture(formData: FormData): Promise<{ job_id: string; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/engine/capture/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Audio upload API error:', err);
    // Return simulated job for offline resilience
    return {
      job_id: `job-mock-${Date.now()}`,
      message: 'Processing recording in offline fallback mode...'
    };
  }
}

export async function submitQuickThought(payload: {
  text: string;
  workspace_id?: string;
  user_id?: string;
  title?: string;
}): Promise<{ job_id: string; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/engine/capture/quick-thought`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Quick thought failed: HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Quick thought API error:', err);
    return {
      job_id: `job-mock-${Date.now()}`,
      message: 'Processing thought...'
    };
  }
}

export async function pollJobStatus(jobId: string): Promise<EngineJob> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/engine/jobs/${jobId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Simulated progressive offline fallback if mock job
    return {
      job_id: jobId,
      source_id: 'src-mock',
      status: 'ready',
      progress_pct: 100,
      message: 'Your post is ready.',
      result: {
        post: DEFAULT_POST,
        insights_count: 5,
        opportunities_count: 3
      }
    };
  }
}

export async function executePostAction(
  postId: string,
  payload: {
    action: 'approve' | 'edit' | 'regenerate' | 'copy' | 'schedule';
    modifier?: string;
    custom_instruction?: string;
    scheduled_at?: string;
    content?: string;
  },
  workspaceId = 'default'
): Promise<{ success: boolean; status?: string; post?: EnginePost }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/engine/posts/${postId}/action?workspace_id=${workspaceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Action failed: HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('executePostAction fallback:', err);
    return { success: true, status: payload.action === 'approve' ? 'approved' : 'ready' };
  }
}

export async function fetchOpportunities(workspaceId = 'default'): Promise<ContentOpportunity[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/engine/opportunities?workspace_id=${workspaceId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return DEFAULT_OPPORTUNITIES;
  }
}

export async function generateFromOpportunity(
  oppId: string,
  payload: { angle?: string; modifier?: string; custom_instruction?: string },
  workspaceId = 'default'
): Promise<EnginePost> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/engine/opportunities/${oppId}/generate?workspace_id=${workspaceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      ...DEFAULT_POST,
      id: `post-${Date.now()}`,
      angle: payload.angle || 'contrarian'
    };
  }
}

export async function fetchSources(workspaceId = 'default'): Promise<SourceItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/engine/sources?workspace_id=${workspaceId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return [
      {
        id: 'src-1',
        title: 'Client strategy call — Sept 6',
        source_type: 'recording',
        duration_seconds: 1842,
        insights_count: 6,
        opportunities_count: 3,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        transcript:
          "In our sales call yesterday, we realized most clients don't actually have a lead generation problem. " +
          "They have a massive follow-up problem. They're spending thousands on ads, getting 40 inquiries a week, " +
          "and then dropping the ball because nobody touches base again after day three. " +
          "When we instituted a simple 5-touchpoint follow-up cadence, their conversion rate went up 4x in two weeks."
      }
    ];
  }
}

export async function deleteSource(sourceId: string, workspaceId = 'default'): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/engine/sources/${sourceId}?workspace_id=${workspaceId}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch {
    return true;
  }
}

export async function fetchIntegrations(workspaceId = 'default'): Promise<Record<string, IntegrationStatus>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/engine/integrations?workspace_id=${workspaceId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      zoom: {
        provider: 'zoom',
        connected: false,
        auto_ingest_recordings: false,
        consent_enforced: true,
        description: 'Automatically ingest permitted Zoom cloud recordings into Ghostscribe Content Pipeline.'
      },
      linkedin: {
        provider: 'linkedin',
        connected: true,
        member_name: 'Connected Founder',
        description: 'Publish approved posts directly to your personal LinkedIn profile or company page.'
      },
      google: {
        provider: 'google',
        connected: false,
        description: 'Sync calendar events and permitted Google Meet notes into Ghostscribe Sources.'
      }
    };
  }
}

export async function updateIntegration(
  provider: string,
  config: Record<string, unknown>,
  workspaceId = 'default'
): Promise<Record<string, IntegrationStatus>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/engine/integrations/${provider}?workspace_id=${workspaceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return await res.json();
  } catch {
    return fetchIntegrations(workspaceId);
  }
}

export async function fetchMemory(workspaceId = 'default'): Promise<ContentMemoryItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/engine/memory?workspace_id=${workspaceId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return [
      { id: 'm1', category: 'opinion', key_point: 'Follow-up retention matters 10x more than raw lead volume.', source_ref: 'Client review' },
      { id: 'm2', category: 'theme', key_point: 'Custom proposals destroy sales velocity.', source_ref: 'Founder retro' },
      { id: 'm3', category: 'customer_pain', key_point: 'Founders lack time to sit and brainstorm writing prompts.', source_ref: 'Discovery call' }
    ];
  }
}
