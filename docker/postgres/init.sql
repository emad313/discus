-- Initialize Discus Database Schema

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
    id VARCHAR(10) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    host_id VARCHAR(255),
    title VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    max_participants INTEGER DEFAULT 100,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id VARCHAR(10) REFERENCES meetings(id) ON DELETE CASCADE,
    user_id VARCHAR(255),
    username VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    is_host BOOLEAN DEFAULT FALSE,
    connection_quality VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Meeting recordings (for future feature)
CREATE TABLE IF NOT EXISTS recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id VARCHAR(10) REFERENCES meetings(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    file_path VARCHAR(500),
    file_size BIGINT,
    duration INTEGER,
    status VARCHAR(50) DEFAULT 'processing'
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id VARCHAR(10) REFERENCES meetings(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES participants(id) ON DELETE SET NULL,
    username VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_private BOOLEAN DEFAULT FALSE,
    recipient_id UUID REFERENCES participants(id) ON DELETE SET NULL
);

-- Indexes for better performance with 100+ users
CREATE INDEX idx_meetings_active ON meetings(is_active);
CREATE INDEX idx_meetings_created ON meetings(created_at);
CREATE INDEX idx_participants_meeting ON participants(meeting_id);
CREATE INDEX idx_participants_joined ON participants(joined_at);
CREATE INDEX idx_chat_messages_meeting ON chat_messages(meeting_id);
CREATE INDEX idx_chat_messages_sent ON chat_messages(sent_at);

-- Analytics table (optional)
CREATE TABLE IF NOT EXISTS meeting_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id VARCHAR(10) REFERENCES meetings(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    participant_count INTEGER,
    avg_connection_quality FLOAT,
    cpu_usage FLOAT,
    memory_usage FLOAT,
    bandwidth_usage BIGINT,
    metrics JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_analytics_meeting ON meeting_analytics(meeting_id);
CREATE INDEX idx_analytics_timestamp ON meeting_analytics(timestamp);

-- Function to clean up old meetings (auto-delete after 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_meetings()
RETURNS void AS $$
BEGIN
    DELETE FROM meetings 
    WHERE ended_at IS NOT NULL 
    AND ended_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Initial data (optional)
INSERT INTO meetings (id, title, host_id) 
VALUES ('demo12345', 'Demo Meeting Room', 'demo-host')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE meetings IS 'Stores meeting room information';
COMMENT ON TABLE participants IS 'Tracks participants in meetings';
COMMENT ON TABLE recordings IS 'Stores meeting recording metadata';
COMMENT ON TABLE chat_messages IS 'Stores chat history';
COMMENT ON TABLE meeting_analytics IS 'Tracks meeting performance metrics';
