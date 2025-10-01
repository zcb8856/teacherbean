import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const createClient = () => {
  // During build time, environment variables might not be available
  // Return a placeholder client that won't be used
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

  return createSupabaseClient(url, key)
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'teacher'
          full_name: string | null
          display_name: string | null
          school_name: string | null
          school_id: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'teacher'
          full_name?: string | null
          display_name?: string | null
          school_name?: string | null
          school_id?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'teacher'
          full_name?: string | null
          display_name?: string | null
          school_name?: string | null
          school_id?: string | null
          avatar_url?: string | null
        }
      }
      classes: {
        Row: {
          id: string
          name: string
          grade: string | null
          description: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          grade?: string | null
          description?: string | null
          owner_id: string
        }
        Update: {
          id?: string
          name?: string
          grade?: string | null
          description?: string | null
          owner_id?: string
        }
      }
      students: {
        Row: {
          id: string
          class_id: string
          alias: string
          real_name_encrypted: string | null
          student_number: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          class_id: string
          alias: string
          real_name_encrypted?: string | null
          student_number?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          class_id?: string
          alias?: string
          real_name_encrypted?: string | null
          student_number?: string | null
          avatar_url?: string | null
        }
      }
      materials: {
        Row: {
          id: string
          owner_id: string
          type: 'lesson_plan' | 'ppt_outline' | 'reading' | 'dialog' | 'game' | 'template'
          title: string
          description: string | null
          content_json: any
          tags: string[]
          shared: 'private' | 'school' | 'public'
          cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          estimated_duration: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          type: 'lesson_plan' | 'ppt_outline' | 'reading' | 'dialog' | 'game' | 'template'
          title: string
          description?: string | null
          content_json: any
          tags?: string[]
          shared?: 'private' | 'school' | 'public'
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          estimated_duration?: number | null
        }
        Update: {
          id?: string
          owner_id?: string
          type?: 'lesson_plan' | 'ppt_outline' | 'reading' | 'dialog' | 'game' | 'template'
          title?: string
          description?: string | null
          content_json?: any
          tags?: string[]
          shared?: 'private' | 'school' | 'public'
          cefr_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null
          estimated_duration?: number | null
        }
      }
      items: {
        Row: {
          id: string
          owner_id: string
          type: 'mcq' | 'cloze' | 'error_correction' | 'matching' | 'reading_q' | 'writing_task'
          level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          stem: string
          options_json: any | null
          answer_json: any
          explanation: string | null
          tags: string[]
          source: string | null
          difficulty_score: number | null
          usage_count: number | null
          correct_rate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          type: 'mcq' | 'cloze' | 'error_correction' | 'matching' | 'reading_q' | 'writing_task'
          level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          stem: string
          options_json?: any | null
          answer_json: any
          explanation?: string | null
          tags?: string[]
          source?: string | null
          difficulty_score?: number | null
          usage_count?: number | null
          correct_rate?: number | null
        }
        Update: {
          id?: string
          owner_id?: string
          type?: 'mcq' | 'cloze' | 'error_correction' | 'matching' | 'reading_q' | 'writing_task'
          level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
          stem?: string
          options_json?: any | null
          answer_json?: any
          explanation?: string | null
          tags?: string[]
          source?: string | null
          difficulty_score?: number | null
          usage_count?: number | null
          correct_rate?: number | null
        }
      }
      assignments: {
        Row: {
          id: string
          class_id: string
          title: string
          description: string | null
          type: 'quiz' | 'homework' | 'writing'
          payload_json: any
          max_score: number | null
          due_at: string | null
          is_published: boolean | null
          allow_late_submission: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          class_id: string
          title: string
          description?: string | null
          type: 'quiz' | 'homework' | 'writing'
          payload_json: any
          max_score?: number | null
          due_at?: string | null
          is_published?: boolean | null
          allow_late_submission?: boolean | null
        }
        Update: {
          id?: string
          class_id?: string
          title?: string
          description?: string | null
          type?: 'quiz' | 'homework' | 'writing'
          payload_json?: any
          max_score?: number | null
          due_at?: string | null
          is_published?: boolean | null
          allow_late_submission?: boolean | null
        }
      }
      submissions: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          answers_json: any
          score_json: any | null
          total_score: number | null
          feedback_json: any | null
          submitted_at: string
          graded_at: string | null
          is_late: boolean | null
        }
        Insert: {
          id?: string
          assignment_id: string
          student_id: string
          answers_json: any
          score_json?: any | null
          total_score?: number | null
          feedback_json?: any | null
          submitted_at?: string
          graded_at?: string | null
          is_late?: boolean | null
        }
        Update: {
          id?: string
          assignment_id?: string
          student_id?: string
          answers_json?: any
          score_json?: any | null
          total_score?: number | null
          feedback_json?: any | null
          submitted_at?: string
          graded_at?: string | null
          is_late?: boolean | null
        }
      }
      writings: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          text: string
          word_count: number | null
          rubric_json: any | null
          ai_feedback: any | null
          teacher_feedback: string | null
          revised_text: string | null
          final_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          student_id: string
          text: string
          word_count?: number | null
          rubric_json?: any | null
          ai_feedback?: any | null
          teacher_feedback?: string | null
          revised_text?: string | null
          final_score?: number | null
        }
        Update: {
          id?: string
          assignment_id?: string
          student_id?: string
          text?: string
          word_count?: number | null
          rubric_json?: any | null
          ai_feedback?: any | null
          teacher_feedback?: string | null
          revised_text?: string | null
          final_score?: number | null
        }
      }
      learning_analytics: {
        Row: {
          id: string
          student_id: string
          class_id: string
          subject_area: string | null
          skill_tag: string | null
          performance_score: number | null
          attempts: number | null
          last_attempt_at: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id: string
          subject_area?: string | null
          skill_tag?: string | null
          performance_score?: number | null
          attempts?: number | null
          last_attempt_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string
          subject_area?: string | null
          skill_tag?: string | null
          performance_score?: number | null
          attempts?: number | null
          last_attempt_at?: string
        }
      }
    }
  }
}