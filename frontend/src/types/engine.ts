export type SourceType =
  | 'recording'
  | 'uploaded_audio'
  | 'quick_thought'
  | 'event'
  | 'zoom'
  | 'calendar'
  | 'email';

export type JobStatus =
  | 'idle'
  | 'uploaded'
  | 'transcribing'
  | 'extracting'
  | 'scoring'
  | 'generating'
  | 'ready'
  | 'failed';

export interface SourceItem {
  id: string;
  title: string;
  source_type: SourceType;
  duration_seconds: number;
  transcript?: string;
  insights_count?: number;
  opportunities_count?: number;
  created_at: string;
}

export interface Provenance {
  source_title: string;
  source_timestamp?: number;
  derived_from: string;
  evidence_quote?: string;
  content_angle: string;
}

export interface PostMetrics {
  icp_relevance: number;
  originality: number;
  confidence: number;
  overall_score?: number;
}

export type PostStatus =
  | 'recommended_today'
  | 'ready'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'dismissed';

export interface EnginePost {
  id: string;
  opportunity_id?: string;
  source_id?: string;
  title?: string;
  content: string;
  platform: 'linkedin' | 'twitter' | 'threads';
  angle: string;
  status: PostStatus;
  scheduled_at?: string;
  provenance: Provenance;
  metrics: PostMetrics;
  created_at: string;
  /** Raw transcript used to generate this post — stored for grounded regeneration */
  transcript?: string;
}

export interface ContentOpportunity {
  id: string;
  source_id?: string;
  source_title?: string;
  title: string;
  summary: string;
  why_interesting: string;
  content_type: string;
  recommended_angle: string;
  available_angles: string[];
  icp_relevance: number;
  originality: number;
  overall_score: number;
  status: 'ready' | 'approved' | 'dismissed' | 'used';
  evidence?: string;
  source_timestamp?: number;
}

export interface ContentMemoryItem {
  id: string;
  category: string;
  key_point: string;
  details?: string;
  source_ref?: string;
}

export interface IntegrationStatus {
  provider: 'zoom' | 'linkedin' | 'google';
  connected: boolean;
  account_email?: string;
  member_name?: string;
  auto_ingest_recordings?: boolean;
  consent_enforced?: boolean;
  description: string;
}

export interface EngineJob {
  job_id: string;
  source_id: string;
  status: JobStatus;
  progress_pct: number;
  message: string;
  result?: {
    post?: EnginePost;
    source?: SourceItem;
    insights_count?: number;
    opportunities_count?: number;
    /** Dev: number of chars in the transcript used for generation */
    transcript_chars?: number;
    /** Dev: first 200 chars of transcript for verification */
    transcript_preview?: string;
  };
}
