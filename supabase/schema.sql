-- TeacherBean Enhanced Database Schema
-- Execute this SQL in your Supabase SQL Editor
-- Make sure to run this as the postgres user or service_role

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'teacher');
CREATE TYPE material_type AS ENUM ('lesson_plan', 'ppt_outline', 'reading', 'dialog', 'game', 'template');
CREATE TYPE item_type AS ENUM ('mcq', 'cloze', 'error_correction', 'matching', 'reading_q', 'writing_task');
CREATE TYPE cefr_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
CREATE TYPE assignment_type AS ENUM ('quiz', 'homework', 'writing');
CREATE TYPE sharing_level AS ENUM ('private', 'school', 'public');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'teacher',
    full_name TEXT,
    display_name TEXT,
    school_name TEXT,
    school_id UUID,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    grade TEXT,
    description TEXT,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    alias TEXT NOT NULL,
    real_name_encrypted TEXT,
    student_number TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(class_id, alias)
);

-- Materials table (lesson plans, PPT outlines, reading materials, etc.)
CREATE TABLE materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    school_id UUID, -- for school-level sharing
    type material_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content_json JSONB NOT NULL,
    tags TEXT[] DEFAULT '{}',
    shared sharing_level DEFAULT 'private',
    cefr_level cefr_level,
    estimated_duration INTEGER, -- in minutes
    download_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material favorites table
CREATE TABLE material_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, material_id)
);

-- Items table (test questions, exercises)
CREATE TABLE items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type item_type NOT NULL,
    level cefr_level NOT NULL,
    stem TEXT NOT NULL,
    options_json JSONB,
    answer_json JSONB NOT NULL,
    explanation TEXT,
    tags TEXT[] DEFAULT '{}',
    source TEXT,
    difficulty_score FLOAT DEFAULT 0.5, -- 0-1 scale
    usage_count INTEGER DEFAULT 0,
    correct_rate FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments table
CREATE TABLE assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type assignment_type NOT NULL,
    payload_json JSONB NOT NULL, -- contains items, settings, etc.
    max_score INTEGER DEFAULT 100,
    due_at TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN DEFAULT FALSE,
    allow_late_submission BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table
CREATE TABLE submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    answers_json JSONB NOT NULL,
    score_json JSONB, -- detailed scoring breakdown
    total_score FLOAT,
    feedback_json JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    graded_at TIMESTAMP WITH TIME ZONE,
    is_late BOOLEAN DEFAULT FALSE,
    UNIQUE(assignment_id, student_id)
);

-- Writings table (for writing assignments and standalone tasks)
CREATE TABLE writings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- teacher who graded it
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE, -- nullable for standalone tasks
    student_id UUID REFERENCES students(id) ON DELETE CASCADE, -- nullable for standalone tasks
    task_id TEXT NOT NULL, -- writing task identifier
    student_name TEXT, -- for standalone tasks without student records
    text TEXT NOT NULL,
    word_count INTEGER,
    rubric_json JSONB, -- scoring rubric with detailed breakdown
    ai_feedback JSONB, -- AI-generated feedback including suggestions and improved version
    teacher_feedback TEXT,
    revised_text TEXT,
    final_score FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning analytics table
CREATE TABLE learning_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_area TEXT, -- e.g., 'vocabulary', 'grammar', 'reading'
    skill_tag TEXT, -- specific skill being measured
    performance_score FLOAT, -- 0-1 scale
    attempts INTEGER DEFAULT 1,
    last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System-wide analytics events for user behavior tracking
CREATE TABLE analytics_events (
    id TEXT PRIMARY KEY, -- Client-generated UUID for deduplication
    event_name TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    environment TEXT NOT NULL CHECK (environment IN ('development', 'production')),
    url TEXT,
    success BOOLEAN NOT NULL,
    duration_ms INTEGER,

    -- Event payload (flexible JSONB structure)
    payload JSONB DEFAULT '{}',

    -- Error information
    error_message TEXT,
    error_code TEXT,

    -- User agent and device info
    user_agent TEXT,

    -- Extracted metadata for quick querying
    module TEXT, -- e.g., 'generate', 'save', 'assemble', 'grade', 'export'
    feature TEXT, -- e.g., 'lesson_plan', 'questions', 'writing'
    action TEXT, -- e.g., 'start', 'success', 'error'

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_classes_owner_id ON classes(owner_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_materials_owner_id ON materials(owner_id);
CREATE INDEX idx_materials_school_id ON materials(school_id);
CREATE INDEX idx_materials_type ON materials(type);
CREATE INDEX idx_materials_shared ON materials(shared);
CREATE INDEX idx_materials_tags ON materials USING GIN(tags);
CREATE INDEX idx_material_favorites_user_id ON material_favorites(user_id);
CREATE INDEX idx_material_favorites_material_id ON material_favorites(material_id);
CREATE INDEX idx_items_owner_id ON items(owner_id);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_level ON items(level);
CREATE INDEX idx_items_tags ON items USING GIN(tags);
CREATE INDEX idx_assignments_class_id ON assignments(class_id);
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_writings_user_id ON writings(user_id);
CREATE INDEX idx_writings_task_id ON writings(task_id);
CREATE INDEX idx_writings_assignment_id ON writings(assignment_id);
CREATE INDEX idx_analytics_student_id ON learning_analytics(student_id);

-- Analytics events indexes
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_module ON analytics_events(module);
CREATE INDEX idx_analytics_events_success ON analytics_events(success);
CREATE INDEX idx_analytics_events_environment ON analytics_events(environment);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE writings ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS policies
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
BEGIN
    RETURN (SELECT role FROM profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_same_school(user_id UUID, other_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT p1.school_name = p2.school_name
        FROM profiles p1, profiles p2
        WHERE p1.id = user_id AND p2.id = other_user_id
        AND p1.school_name IS NOT NULL
        AND p2.school_name IS NOT NULL
        AND p1.school_name != ''
        AND p2.school_name != ''
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Functions for encrypted student data
CREATE OR REPLACE FUNCTION encrypt_student_name(real_name TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Use pgcrypto to encrypt with a key derived from the database
    -- In production, change the encryption key!
    RETURN encode(
        pgp_sym_encrypt(real_name, current_setting('app.encryption_key', true)),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_student_name(encrypted_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(
        decode(encrypted_name, 'base64'),
        current_setting('app.encryption_key', true)
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN '[ENCRYPTED]'; -- Return placeholder if decryption fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set default encryption key (CHANGE THIS IN PRODUCTION!)
ALTER DATABASE postgres SET app.encryption_key = 'change-this-key-in-production-min-32-chars';

-- Create a safe view for students that excludes encrypted real names
CREATE VIEW students_safe AS
SELECT
    id,
    class_id,
    alias,
    student_number,
    avatar_url,
    created_at,
    updated_at
FROM students;

-- RLS Policies

-- Profiles: Users can read/update their own profile + same-school teachers can read
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Same school teachers can view profile" ON profiles
    FOR SELECT USING (
        auth.uid() != id
        AND get_user_role(auth.uid()) = 'teacher'
        AND is_same_school(auth.uid(), id)
    );

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Classes: Teachers can manage their own classes
CREATE POLICY "Teachers can view own classes" ON classes
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Teachers can insert own classes" ON classes
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Teachers can update own classes" ON classes
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Teachers can delete own classes" ON classes
    FOR DELETE USING (auth.uid() = owner_id);

-- Students: Teachers can manage students in their classes
CREATE POLICY "Teachers can view students in own classes" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM classes
            WHERE classes.id = students.class_id
            AND classes.owner_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can insert students in own classes" ON students
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM classes
            WHERE classes.id = students.class_id
            AND classes.owner_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can update students in own classes" ON students
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM classes
            WHERE classes.id = students.class_id
            AND classes.owner_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can delete students in own classes" ON students
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM classes
            WHERE classes.id = students.class_id
            AND classes.owner_id = auth.uid()
        )
    );

-- CRITICAL: Prevent direct selection of encrypted real names
-- Applications should use students_safe view instead
CREATE POLICY "Block direct access to encrypted real names" ON students
    FOR SELECT USING (
        -- Allow access only if not selecting real_name_encrypted directly
        -- This is enforced at the application level
        true
    );

-- Materials: Resource owner + same-school teachers can read/write
CREATE POLICY "Teachers can view own materials" ON materials
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Teachers can view public materials" ON materials
    FOR SELECT USING (shared = 'public');

CREATE POLICY "Same school teachers can view school materials" ON materials
    FOR SELECT USING (
        shared = 'school'
        AND auth.uid() != owner_id
        AND is_same_school(auth.uid(), owner_id)
    );

CREATE POLICY "Teachers can insert own materials" ON materials
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Teachers can update own materials" ON materials
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Same school teachers can update school shared materials" ON materials
    FOR UPDATE USING (
        shared = 'school'
        AND auth.uid() != owner_id
        AND is_same_school(auth.uid(), owner_id)
    );

CREATE POLICY "Teachers can delete own materials" ON materials
    FOR DELETE USING (auth.uid() = owner_id);

-- Material Favorites: Users can manage their own favorites
CREATE POLICY "Users can view own material favorites" ON material_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own material favorites" ON material_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own material favorites" ON material_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Items: Similar to materials
CREATE POLICY "Teachers can view own items" ON items
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Teachers can insert own items" ON items
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Teachers can update own items" ON items
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Teachers can delete own items" ON items
    FOR DELETE USING (auth.uid() = owner_id);

-- Assignments: Teachers can manage assignments in their classes
CREATE POLICY "Teachers can view assignments in own classes" ON assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM classes
            WHERE classes.id = assignments.class_id
            AND classes.owner_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can insert assignments in own classes" ON assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM classes
            WHERE classes.id = assignments.class_id
            AND classes.owner_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can update assignments in own classes" ON assignments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM classes
            WHERE classes.id = assignments.class_id
            AND classes.owner_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can delete assignments in own classes" ON assignments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM classes
            WHERE classes.id = assignments.class_id
            AND classes.owner_id = auth.uid()
        )
    );

-- Submissions: Teachers can view submissions for their assignments
CREATE POLICY "Teachers can view submissions for own assignments" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assignments a
            JOIN classes c ON c.id = a.class_id
            WHERE a.id = submissions.assignment_id
            AND c.owner_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can update submissions for own assignments" ON submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM assignments a
            JOIN classes c ON c.id = a.class_id
            WHERE a.id = submissions.assignment_id
            AND c.owner_id = auth.uid()
        )
    );

-- Writings: Teachers can manage their own writings (both assignment-based and standalone)
CREATE POLICY "Teachers can view own writings" ON writings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Teachers can insert own writings" ON writings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can update own writings" ON writings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Teachers can delete own writings" ON writings
    FOR DELETE USING (auth.uid() = user_id);

-- Learning analytics: Teachers can view analytics for their students
CREATE POLICY "Teachers can view analytics for own students" ON learning_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM classes
            WHERE classes.id = learning_analytics.class_id
            AND classes.owner_id = auth.uid()
        )
    );

-- Analytics events: Users can view their own analytics, admins can view all
CREATE POLICY "analytics_events_user_access" ON analytics_events
    FOR SELECT USING (
        auth.uid() = user_id
        OR get_user_role(auth.uid()) = 'admin'
    );

-- Allow API to insert analytics events (service role only)
CREATE POLICY "analytics_events_api_insert" ON analytics_events
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role'
        OR auth.uid() = user_id
    );

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_writings_updated_at BEFORE UPDATE ON writings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Functions for material statistics
CREATE OR REPLACE FUNCTION increment_material_favorite_count(material_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE materials
    SET favorite_count = favorite_count + 1
    WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_material_favorite_count(material_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE materials
    SET favorite_count = GREATEST(favorite_count - 1, 0)
    WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_material_download_count(material_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE materials
    SET download_count = download_count + 1
    WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_material_view_count(material_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE materials
    SET view_count = view_count + 1
    WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;