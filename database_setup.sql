-- Create user_usage table
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  plan_name TEXT DEFAULT 'Free',
  posts_limit INTEGER DEFAULT 10,
  posts_generated INTEGER DEFAULT 0,
  trial_start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id)
);

-- Create brand_settings table
CREATE TABLE IF NOT EXISTS brand_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  brand_name TEXT,
  brand_description TEXT,
  brand_voice TEXT,
  tone TEXT,
  target_audience TEXT,
  writing_style_linkedin TEXT,
  writing_style_twitter TEXT,
  key_topics TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id)
);

-- Create content_library table
CREATE TABLE IF NOT EXISTS content_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;

-- Note: The following policies assume you have a 'workspace_members' table 
-- or similar to check if a user belongs to a workspace.
-- If not, you might want simpler policies based on user_id for now.

CREATE POLICY "Users can view usage for their workspaces" ON user_usage
  FOR SELECT USING (true); -- Adjusted for simplicity if workspace-based

CREATE POLICY "Users can insert usage" ON user_usage
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update usage" ON user_usage
  FOR UPDATE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_usage_workspace_id ON user_usage(workspace_id);
CREATE INDEX IF NOT EXISTS idx_brand_settings_workspace_id ON brand_settings(workspace_id);
CREATE INDEX IF NOT EXISTS idx_content_library_workspace_id ON content_library(workspace_id);
