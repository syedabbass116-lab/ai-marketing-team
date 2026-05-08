-- 1. Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL, -- references auth.users(id)
  plan TEXT DEFAULT 'Free',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create workspace_members table
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- references auth.users(id)
  role TEXT DEFAULT 'member', -- owner, admin, member
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- 3. Create user_usage table
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  plan_name TEXT DEFAULT 'Free',
  posts_limit INTEGER DEFAULT 10,
  posts_generated INTEGER DEFAULT 0,
  trial_start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id)
);

-- 4. Create brand_settings table
CREATE TABLE IF NOT EXISTS brand_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  brand_name TEXT,
  brand_description TEXT,
  brand_voice TEXT,
  tone TEXT,
  target_audience TEXT,
  writing_style_linkedin TEXT,
  writing_style_twitter TEXT,
  writing_style_threads TEXT,
  key_topics TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id)
);

-- 5. Create content_library table
CREATE TABLE IF NOT EXISTS content_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create billing_history table
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  amount TEXT NOT NULL,
  status TEXT DEFAULT 'Paid',
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Simplified - allow all authenticated users for now)
CREATE POLICY "Allow all for authenticated" ON workspaces FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON workspace_members FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON user_usage FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON brand_settings FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON content_library FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON billing_history FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wm_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_bs_ws_id ON brand_settings(workspace_id);
CREATE INDEX IF NOT EXISTS idx_cl_ws_id ON content_library(workspace_id);
