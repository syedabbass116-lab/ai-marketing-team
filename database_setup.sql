-- Create user_usage table
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  posts_generated INTEGER DEFAULT 0,
  is_pro BOOLEAN DEFAULT FALSE,
  trial_start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create brand_settings table
CREATE TABLE IF NOT EXISTS brand_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  brand_name TEXT,
  brand_description TEXT,
  brand_voice TEXT,
  tone TEXT,
  target_audience TEXT,
  writing_style_linkedin TEXT,
  writing_style_twitter TEXT,
  key_topics TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_library table
CREATE TABLE IF NOT EXISTS content_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create policies for user_usage
CREATE POLICY "Users can view their own usage" ON user_usage
  FOR SELECT USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own usage" ON user_usage
  FOR INSERT WITH CHECK (clerk_user_id = auth.uid()::text);

CREATE POLICY "Users can update their own usage" ON user_usage
  FOR UPDATE USING (clerk_user_id = auth.uid()::text);

-- Create policies for brand_settings
CREATE POLICY "Users can view their own brand settings" ON brand_settings
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own brand settings" ON brand_settings
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own brand settings" ON brand_settings
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Create policies for content_library
CREATE POLICY "Users can view their own content" ON content_library
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own content" ON content_library
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own content" ON content_library
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own content" ON content_library
  FOR DELETE USING (user_id = auth.uid()::text);

-- Create indexes for better performance
CREATE INDEX idx_user_usage_clerk_user_id ON user_usage(clerk_user_id);
CREATE INDEX idx_brand_settings_user_id ON brand_settings(user_id);
CREATE INDEX idx_content_library_user_id ON content_library(user_id);
