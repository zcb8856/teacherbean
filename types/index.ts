import { Database } from '@/lib/supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Class = Database['public']['Tables']['classes']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Material = Database['public']['Tables']['materials']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type Assignment = Database['public']['Tables']['assignments']['Row']
export type Submission = Database['public']['Tables']['submissions']['Row']
export type Writing = Database['public']['Tables']['writings']['Row']
export type LearningAnalytics = Database['public']['Tables']['learning_analytics']['Row']

export type UserRole = 'admin' | 'teacher'
export type MaterialType = 'lesson_plan' | 'ppt_outline' | 'reading' | 'dialog' | 'game' | 'template'
export type ItemType = 'mcq' | 'cloze' | 'error_correction' | 'matching' | 'reading_q' | 'writing_task'
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type AssignmentType = 'quiz' | 'homework' | 'writing'
export type SharingLevel = 'private' | 'school' | 'public'

// Lesson Plan Structure
export interface LessonPlan {
  title: string
  level: CEFRLevel
  duration: number
  objectives: string[]
  materials: string[]
  procedures: LessonActivity[]
  assessment: string
  homework?: string
  notes?: string
}

export interface LessonActivity {
  type: 'warm_up' | 'presentation' | 'practice' | 'production' | 'wrap_up'
  duration: number
  description: string
  materials?: string[]
  instructions?: string[]
}

// Reading Material Structure
export interface ReadingMaterial {
  title: string
  level: CEFRLevel
  text: string
  vocabulary: VocabularyItem[]
  questions: ReadingQuestion[]
  themes: string[]
  estimated_time: number
}

export interface VocabularyItem {
  word: string
  definition: string
  pronunciation?: string
  example?: string
}

export interface ReadingQuestion {
  type: 'mcq' | 'true_false' | 'short_answer' | 'matching'
  question: string
  options?: string[]
  answer: string | number | string[]
  explanation?: string
}

// Dialog Structure
export interface DialogMaterial {
  title: string
  scenario: string
  level: CEFRLevel
  participants: string[]
  exchanges: DialogExchange[]
  vocabulary_focus: string[]
  cultural_notes?: string[]
}

export interface DialogExchange {
  speaker: string
  text: string
  emotion?: string
  pronunciation_tips?: string[]
}

// Game Structure
export interface GameMaterial {
  title: string
  type: 'vocabulary_spelling' | 'sentence_matching' | 'quick_qa' | 'word_association'
  level: CEFRLevel
  instructions: string
  items: GameItem[]
  time_limit?: number
  scoring_system: ScoringSystem
}

export interface GameItem {
  prompt: string
  answer: string | string[]
  options?: string[]
  hint?: string
}

export interface ScoringSystem {
  correct_points: number
  incorrect_points: number
  time_bonus?: boolean
  streak_bonus?: boolean
}

// Writing Assignment Structure
export interface WritingAssignment {
  title: string
  type: 'personal_letter' | 'essay' | 'story' | 'report' | 'email'
  level: CEFRLevel
  prompt: string
  requirements: WritingRequirement[]
  rubric: WritingRubric
  word_limit: { min: number; max: number }
  time_limit?: number
}

export interface WritingRequirement {
  category: string
  description: string
  mandatory: boolean
}

export interface WritingRubric {
  criteria: RubricCriterion[]
  total_points: number
}

export interface RubricCriterion {
  name: string
  weight: number // percentage
  levels: RubricLevel[]
}

export interface RubricLevel {
  score: number
  description: string
}

// Assessment Item Structure
export interface MCQItem {
  stem: string
  options: string[]
  correct_answer: number
  explanation?: string
  difficulty: number
}

export interface ClozeItem {
  text: string
  blanks: ClozeBlank[]
  context?: string
}

export interface ClozeBlank {
  position: number
  answer: string[]
  hint?: string
}

export interface MatchingItem {
  instructions: string
  left_items: string[]
  right_items: string[]
  correct_pairs: number[][]
}

// Class Management
export interface ClassWithStats extends Class {
  student_count: number
  recent_assignments: number
  avg_performance: number
}

export interface StudentWithProgress extends Student {
  recent_scores: number[]
  attendance_rate: number
  strengths: string[]
  areas_for_improvement: string[]
}

// Analytics
export interface PerformanceData {
  student_id: string
  skill_area: string
  scores: { date: string; score: number }[]
  trend: 'improving' | 'stable' | 'declining'
}

export interface ClassAnalytics {
  overall_performance: number
  skill_breakdown: { [skill: string]: number }
  difficulty_analysis: { [level: string]: number }
  engagement_metrics: {
    participation_rate: number
    completion_rate: number
    time_on_task: number
  }
}

// UI Component Props
export interface DashboardStats {
  total_classes: number
  total_students: number
  materials_created: number
  assignments_graded: number
  recent_activity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'material_created' | 'assignment_graded' | 'student_added' | 'class_created'
  description: string
  timestamp: string
  class_name?: string
  student_name?: string
}

// Form Types
export interface LessonPlanForm {
  title: string
  level: CEFRLevel
  duration: number
  topic: string
  focus_skills: string[]
  class_size: number
  student_level: string
  special_requirements?: string
  // 新增教案设计字段
  subject: string
  grade: string
  textbook?: string
  curriculum_standards: string
  teaching_objectives: string
  key_points: string
  difficult_points: string
  teaching_methods: string[]
}

export interface ReadingMaterialForm {
  title: string
  level: CEFRLevel
  topic: string
  text_length: 'short' | 'medium' | 'long'
  question_types: ItemType[]
  vocabulary_focus: string[]
  cultural_context?: string
}

export interface AssessmentForm {
  title: string
  type: AssignmentType
  class_id: string
  level: CEFRLevel
  topics: string[]
  item_count: number
  time_limit?: number
  due_date?: string
  instructions?: string
}