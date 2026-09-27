-- ==========================================
-- MERGE: DATABASE SCHEMA
-- ==========================================

-- 1. Users Table (Core manual data)
-- Note: id references Supabase's built-in auth.users table for secure login
CREATE TABLE users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    manual_bio TEXT,
    intent_status TEXT DEFAULT 'LOOKING_TO_JOIN', -- Options: LOOKING_TO_JOIN, RECRUITING, WORKING
    skills TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Developer Metrics (The automated/API data)
CREATE TABLE developer_metrics (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    github_json JSONB, -- Stores the raw API response from GitHub
    leetcode_json JSONB, -- Stores the raw API response from LeetCode
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Projects (For collaboration announcements & tracking)
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    skills_required TEXT[],
    recruiting_for TEXT,
    status TEXT DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Project Members (Handles users having multiple projects)
CREATE TABLE project_members (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (project_id, user_id)
);

-- 5. Matches (The AI Matchmaking Cache)
CREATE TABLE matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_a_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_b_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    ai_match_score INTEGER,
    ai_reasoning TEXT,
    status TEXT DEFAULT 'PENDING', -- Options: PENDING, CONNECTED, TEAM_FORMED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_a_id, user_b_id) -- Prevents duplicate match scores between the same two people
);

-- 6. Messages (For Real-Time Chat)
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Bounties (Micro-tasks bulletin board)
CREATE TABLE bounties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- ENABLE REAL-TIME FOR CHAT
-- ==========================================
-- This tells Supabase to broadcast changes in the messages table over WebSockets
alter publication supabase_realtime add table messages;
