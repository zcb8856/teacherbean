-- 班级管理种子数据
-- 注意：运行此脚本前，请确保已有用户账号并将 'sample-teacher-uuid' 替换为实际的用户 ID

-- 1. 示例班级数据
INSERT INTO classes (id, name, grade, description, owner_id, created_at, updated_at) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  '八年级1班',
  '初二',
  '英语基础班，注重口语和听力训练。学生英语水平为A2-B1级别，班级氛围活跃，学习积极性高。',
  'sample-teacher-uuid', -- 需要替换为实际的 teacher 用户 ID
  NOW() - INTERVAL '2 months',
  NOW() - INTERVAL '1 week'
),
(
  '22222222-2222-2222-2222-222222222222',
  '九年级英语提高班',
  '初三',
  '中考冲刺班，重点训练阅读理解和写作能力。学生目标是在中考中取得优异成绩，课程难度较高。',
  'sample-teacher-uuid', -- 需要替换为实际的 teacher 用户 ID
  NOW() - INTERVAL '1 month',
  NOW() - INTERVAL '3 days'
),
(
  '33333333-3333-3333-3333-333333333333',
  '高一国际班',
  '高一',
  '国际课程预备班，全英文授课环境。学生英语水平B1-B2，为将来的国际课程学习打基础。',
  'sample-teacher-uuid', -- 需要替换为实际的 teacher 用户 ID
  NOW() - INTERVAL '3 weeks',
  NOW() - INTERVAL '2 days'
);

-- 2. 为每个班级添加示例学生
INSERT INTO students (class_id, alias, real_name_encrypted, student_number, created_at, updated_at) VALUES
-- 八年级1班学生
('11111111-1111-1111-1111-111111111111', 'Alex Chen', 'encrypted_real_name_alex', '20240001', NOW() - INTERVAL '2 months', NOW()),
('11111111-1111-1111-1111-111111111111', 'Emma Zhang', 'encrypted_real_name_emma', '20240002', NOW() - INTERVAL '2 months', NOW()),
('11111111-1111-1111-1111-111111111111', 'David Wang', 'encrypted_real_name_david', '20240003', NOW() - INTERVAL '7 weeks', NOW()),
('11111111-1111-1111-1111-111111111111', 'Lily Liu', 'encrypted_real_name_lily', '20240004', NOW() - INTERVAL '6 weeks', NOW()),
('11111111-1111-1111-1111-111111111111', 'Tom Wu', 'encrypted_real_name_tom', '20240005', NOW() - INTERVAL '5 weeks', NOW()),

-- 九年级英语提高班学生
('22222222-2222-2222-2222-222222222222', 'Sarah Li', 'encrypted_real_name_sarah', '20240006', NOW() - INTERVAL '1 month', NOW()),
('22222222-2222-2222-2222-222222222222', 'Michael Zhou', 'encrypted_real_name_michael', '20240007', NOW() - INTERVAL '1 month', NOW()),
('22222222-2222-2222-2222-222222222222', 'Grace Yang', 'encrypted_real_name_grace', '20240008', NOW() - INTERVAL '3 weeks', NOW()),
('22222222-2222-2222-2222-222222222222', 'Kevin Xu', 'encrypted_real_name_kevin', '20240009', NOW() - INTERVAL '2 weeks', NOW()),

-- 高一国际班学生
('33333333-3333-3333-3333-333333333333', 'Sophia Chen', 'encrypted_real_name_sophia', '20240010', NOW() - INTERVAL '3 weeks', NOW()),
('33333333-3333-3333-3333-333333333333', 'Ryan Wang', 'encrypted_real_name_ryan', '20240011', NOW() - INTERVAL '3 weeks', NOW()),
('33333333-3333-3333-3333-333333333333', 'Isabella Liu', 'encrypted_real_name_isabella', '20240012', NOW() - INTERVAL '2 weeks', NOW());

-- 3. 为每个班级添加示例作业
INSERT INTO assignments (class_id, title, description, type, payload_json, max_score, due_at, is_published, created_at, updated_at) VALUES
-- 八年级1班作业
(
  '11111111-1111-1111-1111-111111111111',
  '现在完成时语法测验',
  '测试学生对现在完成时态的掌握程度，包括结构和用法。',
  'quiz',
  '{"questions": [{"id": 1, "type": "mcq", "question": "I _____ to London twice.", "options": ["go", "went", "have gone", "have been"], "answer": 3}], "time_limit": 30, "attempts": 1}',
  100,
  NOW() + INTERVAL '1 week',
  true,
  NOW() - INTERVAL '1 week',
  NOW() - INTERVAL '1 week'
),
(
  '11111111-1111-1111-1111-111111111111',
  '我的假期写作作业',
  '描述你最难忘的一次假期经历，不少于100词。',
  'writing',
  '{"prompt": "Write about your most memorable holiday experience. Use past tense and describe what you did, where you went, and how you felt.", "word_limit": {"min": 100, "max": 200}, "rubric_id": "personal_writing_rubric"}',
  100,
  NOW() + INTERVAL '3 days',
  true,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
),

-- 九年级英语提高班作业
(
  '22222222-2222-2222-2222-222222222222',
  '阅读理解专项训练',
  '中考阅读理解题型练习，包含细节理解和推理判断。',
  'homework',
  '{"reading_passages": 3, "question_types": ["detail", "inference", "main_idea"], "difficulty": "B1"}',
  100,
  NOW() + INTERVAL '2 days',
  true,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),

-- 高一国际班作业
(
  '33333333-3333-3333-3333-333333333333',
  '议论文写作练习',
  '就"学生是否应该穿校服"这一话题写一篇议论文。',
  'writing',
  '{"prompt": "Should students wear school uniforms? Write an argumentative essay stating your opinion with supporting reasons.", "word_limit": {"min": 200, "max": 300}, "rubric_id": "argumentative_essay_rubric"}',
  100,
  NOW() + INTERVAL '5 days',
  false,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);

-- 4. 添加一些学习分析数据
INSERT INTO learning_analytics (student_id, class_id, subject_area, skill_tag, performance_score, attempts, last_attempt_at, created_at) VALUES
-- Alex Chen 的学习数据
((SELECT id FROM students WHERE alias = 'Alex Chen'), '11111111-1111-1111-1111-111111111111', 'grammar', 'present_perfect', 0.85, 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
((SELECT id FROM students WHERE alias = 'Alex Chen'), '11111111-1111-1111-1111-111111111111', 'vocabulary', 'daily_routine', 0.92, 2, NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week'),

-- Emma Zhang 的学习数据
((SELECT id FROM students WHERE alias = 'Emma Zhang'), '11111111-1111-1111-1111-111111111111', 'grammar', 'present_perfect', 0.78, 4, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
((SELECT id FROM students WHERE alias = 'Emma Zhang'), '11111111-1111-1111-1111-111111111111', 'writing', 'personal_narrative', 0.88, 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- Sarah Li 的学习数据
((SELECT id FROM students WHERE alias = 'Sarah Li'), '22222222-2222-2222-2222-222222222222', 'reading', 'inference', 0.75, 5, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
((SELECT id FROM students WHERE alias = 'Sarah Li'), '22222222-2222-2222-2222-222222222222', 'vocabulary', 'academic_words', 0.82, 3, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days');

-- 注意事项：
-- 1. 运行此脚本前，请先创建用户账号并获取真实的用户 ID
-- 2. 将所有 'sample-teacher-uuid' 替换为实际的 teacher 用户 ID
-- 3. 确保 profiles 表中已存在对应的用户记录
-- 4. 这些数据仅供测试使用，生产环境请使用真实数据