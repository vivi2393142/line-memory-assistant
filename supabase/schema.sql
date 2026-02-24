-- LINE Memory Assistant Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: messages (Raw DB)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  group_id VARCHAR(255),
  line_message_id VARCHAR(255) NOT NULL UNIQUE,
  quoted_message_id VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_group_id ON messages(group_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_line_message_id ON messages(line_message_id);

-- ============================================
-- Table: pending_actions
-- ============================================
CREATE TABLE IF NOT EXISTS pending_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  group_id VARCHAR(255),
  action_type VARCHAR(50) NOT NULL DEFAULT 'add_memory',
  draft_content TEXT NOT NULL,
  raw_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Each user can only have one pending action at a time
  UNIQUE(user_id, group_id)
);

-- Indexes
CREATE INDEX idx_pending_user_id ON pending_actions(user_id);
CREATE INDEX idx_pending_expires_at ON pending_actions(expires_at);

-- ============================================
-- Function: Auto-cleanup expired pending actions
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_pending_actions()
RETURNS void AS $$
BEGIN
  DELETE FROM pending_actions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- You can schedule this function to run periodically
-- Or call it manually when needed

-- ============================================
-- Row Level Security (RLS)
-- Optional: Enable if you want to add security policies later
-- ============================================
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pending_actions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE messages IS 'Stores all raw LINE messages';
COMMENT ON TABLE pending_actions IS 'Stores pending memory additions awaiting user confirmation';
COMMENT ON COLUMN pending_actions.expires_at IS 'Pending actions automatically expire after this timestamp';
