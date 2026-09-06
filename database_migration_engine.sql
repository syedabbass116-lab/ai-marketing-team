-- ==============================================================================
-- Ghostscribe Autonomous Content Engine - Schema Migration
-- Run this in your Supabase SQL Editor to enable persistent engine features
-- ==============================================================================

-- 1. Sources table (Voice recordings, uploaded audio, Zoom calls, Quick thoughts, Event captures)
CREATE TABLE IF NOT EXISTS sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'recording', -- 'recording', 'uploaded_audio', 'quick_thought', 'event', 'zoom', 'email', 'calendar'
  title TEXT NOT NULL,
  audio_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT DEFAULT 'uploaded', -- 'uploaded', 'transcribing', 'extracting', 'scoring', 'generating', 'ready', 'failed'
  status_message TEXT DEFAULT 'Processing...',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  raw_text TEXT NOT NULL,
  chunks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insights table (Structured data: stories, opinions, lessons, contrarian beliefs, customer pain, etc.)
CREATE TABLE IF NOT EXISTS insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'story', 'personal_experience', 'opinion', 'contrarian_belief', 'lesson', 'customer_pain', 'mistake', 'framework', etc.
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  evidence TEXT NOT NULL,
  source_timestamp INTEGER DEFAULT 0,
  confidence NUMERIC(4,2) DEFAULT 0.90,
  privacy_risk NUMERIC(4,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Content Opportunities table
CREATE TABLE IF NOT EXISTS content_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  insight_id UUID REFERENCES insights(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  why_interesting TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'Contrarian insight', 'Personal story', 'Tactical framework', etc.
  recommended_angle TEXT NOT NULL DEFAULT 'contrarian', -- 'story', 'contrarian', 'educational', 'framework', 'case_study', 'prediction', 'personal_lesson'
  available_angles JSONB DEFAULT '["contrarian", "story", "educational", "framework", "personal_lesson"]'::jsonb,
  icp_relevance INTEGER DEFAULT 85,
  originality INTEGER DEFAULT 85,
  personal_experience INTEGER DEFAULT 80,
  story_potential INTEGER DEFAULT 80,
  credibility INTEGER DEFAULT 90,
  novelty INTEGER DEFAULT 85,
  repetition_risk INTEGER DEFAULT 10,
  overall_score INTEGER DEFAULT 88,
  status TEXT DEFAULT 'ready', -- 'ready', 'approved', 'dismissed', 'used'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Engine Posts table (Today's Post, Ready queue, Provenance)
CREATE TABLE IF NOT EXISTS engine_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  opportunity_id UUID REFERENCES content_opportunities(id) ON DELETE SET NULL,
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  platform TEXT DEFAULT 'linkedin',
  angle TEXT DEFAULT 'contrarian',
  status TEXT DEFAULT 'recommended_today', -- 'recommended_today', 'ready', 'approved', 'scheduled', 'published', 'dismissed'
  scheduled_at TIMESTAMP WITH TIME ZONE,
  provenance JSONB DEFAULT '{}'::jsonb,
  metrics JSONB DEFAULT '{"icp_relevance": 94, "originality": 89, "confidence": 95}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Content Memory / Founder Brain
CREATE TABLE IF NOT EXISTS content_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  category TEXT NOT NULL, -- 'opinion', 'theme', 'story', 'case_study', 'customer_pain', 'published_topic'
  key_point TEXT NOT NULL,
  details TEXT,
  source_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Integrations table (Zoom, LinkedIn, Google)
CREATE TABLE IF NOT EXISTS integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL, -- 'zoom', 'linkedin', 'google'
  status TEXT DEFAULT 'disconnected', -- 'connected', 'disconnected', 'pending'
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, provider)
);

-- Enable RLS
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE engine_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Allow access for authenticated users
CREATE POLICY "Allow all for authenticated" ON sources FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON transcripts FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON insights FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON content_opportunities FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON engine_posts FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON content_memory FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON integrations FOR ALL USING (true);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_sources_ws_user ON sources(workspace_id, user_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_source ON transcripts(source_id);
CREATE INDEX IF NOT EXISTS idx_insights_source ON insights(source_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_ws ON content_opportunities(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_engine_posts_ws_status ON engine_posts(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_content_memory_ws ON content_memory(workspace_id);
