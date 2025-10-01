-- TeacherBean Seed Data Script
-- Run this after creating the schema and setting up your first teacher account
-- Replace the UUIDs with actual user IDs from your Supabase auth.users table

-- ================================
-- SAMPLE TEACHER ACCOUNT SETUP
-- ================================

-- Step 1: After teacher signup via your app, get their auth.users.id
-- Step 2: Replace 'YOUR_TEACHER_UUID_HERE' with the actual UUID below

-- Create sample teacher profile (if using direct SQL signup)
DO $$
DECLARE
    teacher_uuid UUID := 'b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c';
    teacher2_uuid UUID := 'c1f9e5b6-7d23-5f4e-ab8c-2e3f4a5b6c7d';
BEGIN
    -- Insert sample teacher 1
    INSERT INTO profiles (id, email, role, full_name, display_name, school_name)
    VALUES (
        teacher_uuid,
        'teacher1@example.com',
        'teacher',
        'Sarah Johnson',
        'Ms. Johnson',
        'Lincoln Middle School'
    ) ON CONFLICT (id) DO NOTHING;

    -- Insert sample teacher 2 (same school)
    INSERT INTO profiles (id, email, role, full_name, display_name, school_name)
    VALUES (
        teacher2_uuid,
        'teacher2@example.com',
        'teacher',
        'Michael Chen',
        'Mr. Chen',
        'Lincoln Middle School'
    ) ON CONFLICT (id) DO NOTHING;

    -- Create sample classes
    INSERT INTO classes (id, name, grade, description, owner_id) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Grade 8A English', '8', 'Advanced English class for Grade 8 students', teacher_uuid),
    ('22222222-2222-2222-2222-222222222222', 'Grade 9B English', '9', 'Intermediate English class for Grade 9 students', teacher_uuid),
    ('33333333-3333-3333-3333-333333333333', 'Grade 7C English', '7', 'Beginning English class for Grade 7 students', teacher2_uuid)
    ON CONFLICT (id) DO NOTHING;

    -- Create sample students with encrypted real names
    INSERT INTO students (class_id, alias, real_name_encrypted, student_number) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Alex_S', encrypt_student_name('Alexander Smith'), '20240001'),
    ('11111111-1111-1111-1111-111111111111', 'Emma_J', encrypt_student_name('Emma Johnson'), '20240002'),
    ('11111111-1111-1111-1111-111111111111', 'James_B', encrypt_student_name('James Brown'), '20240003'),
    ('11111111-1111-1111-1111-111111111111', 'Lily_W', encrypt_student_name('Lily Wang'), '20240004'),
    ('11111111-1111-1111-1111-111111111111', 'Carlos_M', encrypt_student_name('Carlos Martinez'), '20240005'),
    ('22222222-2222-2222-2222-222222222222', 'Sarah_D', encrypt_student_name('Sarah Davis'), '20240006'),
    ('22222222-2222-2222-2222-222222222222', 'David_L', encrypt_student_name('David Lee'), '20240007'),
    ('22222222-2222-2222-2222-222222222222', 'Maya_P', encrypt_student_name('Maya Patel'), '20240008'),
    ('33333333-3333-3333-3333-333333333333', 'Tom_R', encrypt_student_name('Thomas Rodriguez'), '20240009'),
    ('33333333-3333-3333-3333-333333333333', 'Sophie_K', encrypt_student_name('Sophie Kim'), '20240010')
    ON CONFLICT (class_id, alias) DO NOTHING;

END $$;

-- ================================
-- SAMPLE LEARNING MATERIALS
-- ================================

-- Sample materials using the teacher UUID
INSERT INTO materials (owner_id, type, title, description, content_json, tags, shared, cefr_level, estimated_duration) VALUES
('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'lesson_plan', 'Present Perfect Tense Introduction', 'Comprehensive lesson plan for introducing present perfect tense',
'{"objectives": ["Students will understand the structure of present perfect tense", "Students will be able to use present perfect in context"], "activities": [{"type": "warm_up", "duration": 10, "description": "Review past tense"}, {"type": "presentation", "duration": 15, "description": "Introduce present perfect structure"}, {"type": "practice", "duration": 20, "description": "Controlled practice exercises"}], "materials": ["Whiteboard", "Handouts", "Audio clips"], "assessment": "Exit ticket with 3 present perfect sentences"}',
'{"grammar", "present_perfect", "beginner"}', 'school', 'A2', 45),

('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'reading', 'My Daily Routine', 'Simple reading passage about daily routines with comprehension questions',
'{"text": "My name is Lisa. I wake up at 7:00 AM every day. First, I brush my teeth and wash my face. Then I have breakfast with my family. I usually eat cereal and drink orange juice. At 8:30 AM, I go to school by bus. School starts at 9:00 AM and ends at 3:30 PM. After school, I do my homework and play with my friends. I have dinner at 6:00 PM and go to bed at 9:00 PM.", "vocabulary": [{"word": "routine", "definition": "things you do regularly"}, {"word": "cereal", "definition": "breakfast food with milk"}], "questions": [{"type": "mcq", "question": "What time does Lisa wake up?", "options": ["6:00 AM", "7:00 AM", "8:00 AM"], "answer": 1}, {"type": "short_answer", "question": "What does Lisa eat for breakfast?", "answer": "cereal"}]}',
'{"daily_routine", "present_simple", "reading"}', 'public', 'A1', 20),

('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'template', 'Writing Rubric - Personal Letter', 'Comprehensive rubric for assessing personal letter writing',
'{"criteria": [{"name": "Content & Ideas", "weight": 25, "levels": [{"score": 4, "description": "Ideas are clear, well-developed, and engaging"}, {"score": 3, "description": "Ideas are clear and adequately developed"}, {"score": 2, "description": "Ideas are somewhat clear but need development"}, {"score": 1, "description": "Ideas are unclear or poorly developed"}]}, {"name": "Organization", "weight": 20, "levels": [{"score": 4, "description": "Clear structure with smooth transitions"}, {"score": 3, "description": "Generally well organized"}, {"score": 2, "description": "Some organizational issues"}, {"score": 1, "description": "Poor organization"}]}, {"name": "Language Use", "weight": 30, "levels": [{"score": 4, "description": "Excellent grammar and vocabulary"}, {"score": 3, "description": "Good grammar with minor errors"}, {"score": 2, "description": "Some grammar errors that don''t impede understanding"}, {"score": 1, "description": "Frequent errors that impede understanding"}]}, {"name": "Mechanics", "weight": 15, "levels": [{"score": 4, "description": "No spelling or punctuation errors"}, {"score": 3, "description": "Few spelling/punctuation errors"}, {"score": 2, "description": "Some spelling/punctuation errors"}, {"score": 1, "description": "Many spelling/punctuation errors"}]}, {"name": "Task Completion", "weight": 10, "levels": [{"score": 4, "description": "Fully addresses all requirements"}, {"score": 3, "description": "Addresses most requirements"}, {"score": 2, "description": "Addresses some requirements"}, {"score": 1, "description": "Minimal attempt at requirements"}]}], "total_points": 100}',
'{"writing", "assessment", "rubric", "personal_letter"}', 'school', 'A2', 0);

-- ================================
-- SAMPLE TEST ITEMS (20 QUESTIONS)
-- ================================

-- Grammar: Present Simple & Present Continuous (A1 Level)
INSERT INTO items (owner_id, type, level, stem, options_json, answer_json, explanation, tags, source, difficulty_score) VALUES
('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'mcq', 'A1', 'I _____ English every day.',
'{"options": ["study", "studying", "studied", "studies"]}',
'{"correct": 0, "explanation": "Present simple for habitual actions"}',
'Present simple is used for daily routines and habitual actions.',
'{"grammar", "present_simple", "habits"}', 'Custom', 0.3),

('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'mcq', 'A1', 'She _____ TV right now.',
'{"options": ["watch", "is watching", "watched", "watches"]}',
'{"correct": 1, "explanation": "Present continuous for actions happening now"}',
'Present continuous is used for actions happening at the moment of speaking.',
'{"grammar", "present_continuous", "current_action"}', 'Custom', 0.4),

-- Vocabulary: Family & Daily Activities (A1 Level)
('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'mcq', 'A1', 'My father''s brother is my _____.',
'{"options": ["cousin", "uncle", "nephew", "grandfather"]}',
'{"correct": 1, "explanation": "Father''s brother = uncle"}',
'Basic family vocabulary - understanding family relationships.',
'{"vocabulary", "family", "relationships"}', 'Custom', 0.2),

('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'mcq', 'A1', 'I _____ my teeth every morning.',
'{"options": ["brush", "comb", "wash", "cut"]}',
'{"correct": 0, "explanation": "We brush teeth, not wash or comb them"}',
'Daily routine vocabulary - common collocations.',
'{"vocabulary", "daily_routine", "hygiene"}', 'Custom', 0.3),

-- Grammar: Past Simple (A2 Level)
('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'mcq', 'A2', 'I _____ to London last year.',
'{"options": ["go", "went", "gone", "going"]}',
'{"correct": 1, "explanation": "Past simple for completed actions in the past"}',
'Past simple tense is used for completed actions in the past.',
'{"grammar", "past_simple", "irregular_verbs"}', 'Custom', 0.6),

('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'mcq', 'A2', 'Did you _____ your homework yesterday?',
'{"options": ["do", "did", "done", "doing"]}',
'{"correct": 0, "explanation": "Use base form after auxiliary did"}',
'In questions with did, use the base form of the main verb.',
'{"grammar", "past_simple", "questions"}', 'Custom', 0.5),

-- Cloze Tests
('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'cloze', 'A1', 'Fill in the blanks: I _____ (be) a student. I _____ (have) many friends.',
'{}',
'{"answers": ["am", "have"], "explanation": "Present simple with be and have verbs"}',
'Basic present simple with common verbs be and have.',
'{"grammar", "present_simple", "be_have"}', 'Custom', 0.3),

('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'cloze', 'A2', 'Yesterday I _____ (go) to the park and _____ (meet) my friend.',
'{}',
'{"answers": ["went", "met"], "explanation": "Past simple tense for completed past actions"}',
'Past simple tense practice with irregular verbs.',
'{"grammar", "past_simple", "irregular_verbs"}', 'Custom', 0.6),

-- Matching Exercises
('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'matching', 'A1', 'Match the time expressions:',
'{"left": ["7:00", "12:00", "6:00 PM", "9:30"], "right": ["half past nine", "seven o''clock", "six in the evening", "noon"]}',
'{"pairs": [[0,1], [1,3], [2,2], [3,0]], "explanation": "Basic time telling vocabulary"}',
'Students match digital time with written time expressions.',
'{"vocabulary", "time", "daily_routine"}', 'Custom', 0.4),

('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'matching', 'A1', 'Match the opposites:',
'{"left": ["big", "hot", "fast", "happy"], "right": ["cold", "small", "sad", "slow"]}',
'{"pairs": [[0,1], [1,0], [2,3], [3,2]], "explanation": "Common adjective opposites"}',
'Basic vocabulary - understanding opposite adjectives.',
'{"vocabulary", "adjectives", "opposites"}', 'Custom', 0.3),

-- Error Correction
('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'error_correction', 'A2', 'Find and correct the error: She don''t like coffee.',
'{}',
'{"correction": "She doesn''t like coffee.", "explanation": "Use doesn''t with third person singular"}',
'Third person singular requires doesn''t, not don''t.',
'{"grammar", "present_simple", "negation"}', 'Custom', 0.5),

('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'error_correction', 'A2', 'Find and correct the error: I am going to school yesterday.',
'{}',
'{"correction": "I went to school yesterday.", "explanation": "Use past tense for yesterday"}',
'Yesterday indicates past time, so use past tense, not present continuous.',
'{"grammar", "past_simple", "time_expressions"}', 'Custom', 0.6),

-- Reading Comprehension Items
('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'reading_q', 'A1', 'Read the text: "Tom is 12 years old. He lives in New York with his parents and his sister. He goes to school every day and likes math." Question: How old is Tom?',
'{"options": ["10", "11", "12", "13"]}',
'{"correct": 2, "explanation": "The text clearly states Tom is 12 years old"}',
'Basic reading comprehension - finding specific information.',
'{"reading", "personal_information", "age"}', 'Custom', 0.2),

('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'reading_q', 'A2', 'Read: "Last weekend, Maria went shopping with her mother. They bought new clothes and had lunch at a restaurant. Maria was very happy." Question: When did Maria go shopping?',
'{"options": ["yesterday", "last weekend", "next week", "every day"]}',
'{"correct": 1, "explanation": "The text begins with Last weekend"}',
'Reading comprehension - understanding time references.',
'{"reading", "past_events", "time_reference"}', 'Custom', 0.4),

-- More Grammar - Question Formation (A2)
('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'mcq', 'A2', '_____ you speak English?',
'{"options": ["Do", "Does", "Are", "Is"]}',
'{"correct": 0, "explanation": "Use Do with you for present simple questions"}',
'Question formation in present simple with you.',
'{"grammar", "questions", "present_simple"}', 'Custom', 0.4),

('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'mcq', 'A2', 'What time _____ the movie start?',
'{"options": ["do", "does", "is", "are"]}',
'{"correct": 1, "explanation": "Use does with third person singular (the movie)"}',
'Question formation with third person singular subject.',
'{"grammar", "questions", "third_person"}', 'Custom', 0.5),

-- Prepositions (A1-A2)
('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'mcq', 'A1', 'I go to school _____ bus.',
'{"options": ["by", "in", "on", "with"]}',
'{"correct": 0, "explanation": "We use by for means of transport"}',
'Preposition usage with means of transport.',
'{"grammar", "prepositions", "transport"}', 'Custom', 0.4),

('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'mcq', 'A2', 'The book is _____ the table.',
'{"options": ["in", "on", "at", "by"]}',
'{"correct": 1, "explanation": "Use on for objects placed on surfaces"}',
'Prepositions of place - objects on surfaces.',
'{"grammar", "prepositions", "place"}', 'Custom', 0.3),

-- Comparative Adjectives (A2)
('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'mcq', 'A2', 'This book is _____ than that one.',
'{"options": ["good", "better", "best", "more good"]}',
'{"correct": 1, "explanation": "Better is the comparative form of good"}',
'Irregular comparative adjectives.',
'{"grammar", "comparatives", "irregular"}', 'Custom', 0.6),

('b0e8d4a5-6c12-4e3f-9a7b-1d2e3f4a5b6c', 'mcq', 'A2', 'She is _____ student in the class.',
'{"options": ["smart", "smarter", "smartest", "the smartest"]}',
'{"correct": 3, "explanation": "Use the + superlative for comparing within a group"}',
'Superlative adjectives with definite article.',
'{"grammar", "superlatives", "definite_article"}', 'Custom', 0.7);

-- ================================
-- SAMPLE ASSIGNMENTS & SUBMISSIONS
-- ================================

-- Create a sample quiz assignment
INSERT INTO assignments (id, class_id, title, description, type, payload_json, max_score, due_at, is_published) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Grammar Quiz - Present Simple', 'Test your understanding of present simple tense', 'quiz',
'{"items": [
    {"id": "' || (SELECT id FROM items WHERE stem = 'I _____ English every day.' LIMIT 1) || '", "points": 2},
    {"id": "' || (SELECT id FROM items WHERE stem = 'She _____ TV right now.' LIMIT 1) || '", "points": 2},
    {"id": "' || (SELECT id FROM items WHERE stem = 'My father''s brother is my _____.' LIMIT 1) || '", "points": 2}
], "shuffle_questions": true, "show_feedback": true}',
6, NOW() + INTERVAL '7 days', true);

-- Sample learning analytics
INSERT INTO learning_analytics (student_id, class_id, subject_area, skill_tag, performance_score, attempts) VALUES
((SELECT id FROM students WHERE alias = 'Alex_S' LIMIT 1), '11111111-1111-1111-1111-111111111111', 'grammar', 'present_simple', 0.8, 2),
((SELECT id FROM students WHERE alias = 'Emma_J' LIMIT 1), '11111111-1111-1111-1111-111111111111', 'grammar', 'present_simple', 0.9, 1),
((SELECT id FROM students WHERE alias = 'Alex_S' LIMIT 1), '11111111-1111-1111-1111-111111111111', 'vocabulary', 'family', 0.6, 3),
((SELECT id FROM students WHERE alias = 'Emma_J' LIMIT 1), '11111111-1111-1111-1111-111111111111', 'vocabulary', 'family', 0.7, 2);

-- ================================
-- COMPLETION MESSAGE
-- ================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'TeacherBean Seed Data Created Successfully!';
    RAISE NOTICE '====================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Sample Data Summary:';
    RAISE NOTICE '• 2 Teacher accounts (same school)';
    RAISE NOTICE '• 3 Classes with 10 students total';
    RAISE NOTICE '• 20 Test items (various types & levels)';
    RAISE NOTICE '• Sample materials & templates';
    RAISE NOTICE '• 1 Sample quiz assignment';
    RAISE NOTICE '• Learning analytics data';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Test login with sample teacher accounts';
    RAISE NOTICE '2. Verify RLS policies are working';
    RAISE NOTICE '3. Test creating assignments and submissions';
    RAISE NOTICE '4. Update encryption key in production!';
    RAISE NOTICE '';
END $$;