import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// 定义API输入schemas
export const generateLessonPlanSchema = z.object({
  grade: z.string().min(1, 'Grade is required'),
  subject: z.string().min(1, 'Subject is required'),
  duration: z.number().min(5).max(300, 'Duration must be between 5-300 minutes'),
  objectives: z.array(z.string().min(1)).min(1, 'At least one objective is required'),
  vocabulary: z.array(z.string()).optional(),
  activities: z.array(z.object({
    name: z.string().min(1),
    duration: z.number().min(1),
    description: z.string().min(1)
  })).optional()
})

export const generateQuestionsSchema = z.object({
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  count: z.number().min(1).max(50, 'Count must be between 1-50'),
  type: z.enum(['mcq', 'cloze', 'error_correction', 'matching', 'reading_q', 'writing_task']).optional(),
  topic: z.string().optional(),
  difficulty: z.number().min(0).max(1).optional()
})

export const assessWritingSchema = z.object({
  text: z.string().min(10, 'Text must be at least 10 characters'),
  type: z.enum(['essay', 'letter', 'report', 'story', 'description']).optional().default('essay'),
  rubric: z.object({
    content: z.number().min(0).max(100),
    organization: z.number().min(0).max(100),
    language: z.number().min(0).max(100),
    mechanics: z.number().min(0).max(100)
  }).optional(),
  grade_level: z.enum(['elementary', 'middle', 'high']).optional().default('middle')
})

export const assembleTestSchema = z.object({
  item_types: z.record(z.string(), z.number().min(0).max(1)).refine(
    (data) => {
      const total = Object.values(data).reduce((sum, val) => sum + val, 0)
      return Math.abs(total - 1) < 0.01 // Allow for floating point precision
    },
    { message: 'Item type ratios must sum to 1.0' }
  ),
  difficulty_distribution: z.object({
    easy: z.number().min(0).max(1),
    medium: z.number().min(0).max(1),
    hard: z.number().min(0).max(1)
  }).refine(
    (data) => {
      const total = data.easy + data.medium + data.hard
      return Math.abs(total - 1) < 0.01
    },
    { message: 'Difficulty distribution must sum to 1.0' }
  ),
  total_items: z.number().min(1).max(100),
  cefr_level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  time_limit: z.number().min(5).max(300).optional(),
  shuffle: z.boolean().optional().default(true)
})

describe('API Input Schema Validation', () => {
  describe('generateLessonPlanSchema', () => {
    it('should validate correct lesson plan input', () => {
      const validInput = {
        grade: '七年级',
        subject: 'Food & Health',
        duration: 45,
        objectives: [
          '学生能够掌握健康饮食相关词汇',
          '学生能够用英语描述自己的饮食习惯'
        ],
        vocabulary: ['nutrition', 'healthy', 'diet'],
        activities: [
          {
            name: '词汇学习',
            duration: 15,
            description: '学习健康饮食相关词汇'
          }
        ]
      }

      expect(() => generateLessonPlanSchema.parse(validInput)).not.toThrow()
    })

    it('should reject input with missing required fields', () => {
      const invalidInput = {
        grade: '',
        subject: 'Food & Health',
        duration: 45
      }

      expect(() => generateLessonPlanSchema.parse(invalidInput)).toThrow()
    })

    it('should reject input with invalid duration', () => {
      const invalidInput = {
        grade: '七年级',
        subject: 'Food & Health',
        duration: 400, // Too long
        objectives: ['Learn vocabulary']
      }

      expect(() => generateLessonPlanSchema.parse(invalidInput)).toThrow()
    })

    it('should reject input with empty objectives array', () => {
      const invalidInput = {
        grade: '七年级',
        subject: 'Food & Health',
        duration: 45,
        objectives: []
      }

      expect(() => generateLessonPlanSchema.parse(invalidInput)).toThrow()
    })

    it('should handle optional fields correctly', () => {
      const minimalInput = {
        grade: '七年级',
        subject: 'Food & Health',
        duration: 45,
        objectives: ['Learn vocabulary']
      }

      const result = generateLessonPlanSchema.parse(minimalInput)
      expect(result.vocabulary).toBeUndefined()
      expect(result.activities).toBeUndefined()
    })
  })

  describe('generateQuestionsSchema', () => {
    it('should validate correct question generation input', () => {
      const validInput = {
        level: 'A2' as const,
        count: 10,
        type: 'mcq' as const,
        topic: 'present simple',
        difficulty: 0.5
      }

      expect(() => generateQuestionsSchema.parse(validInput)).not.toThrow()
    })

    it('should reject invalid CEFR level', () => {
      const invalidInput = {
        level: 'X1',
        count: 10
      }

      expect(() => generateQuestionsSchema.parse(invalidInput)).toThrow()
    })

    it('should reject count outside valid range', () => {
      const invalidInput = {
        level: 'A2',
        count: 100 // Too many
      }

      expect(() => generateQuestionsSchema.parse(invalidInput)).toThrow()
    })

    it('should handle optional fields', () => {
      const minimalInput = {
        level: 'B1' as const,
        count: 5
      }

      const result = generateQuestionsSchema.parse(minimalInput)
      expect(result.type).toBeUndefined()
      expect(result.topic).toBeUndefined()
      expect(result.difficulty).toBeUndefined()
    })
  })

  describe('assessWritingSchema', () => {
    it('should validate correct writing assessment input', () => {
      const validInput = {
        text: 'This is a sample essay about my favorite season. I love autumn because...',
        type: 'essay' as const,
        rubric: {
          content: 85,
          organization: 80,
          language: 75,
          mechanics: 90
        },
        grade_level: 'middle' as const
      }

      expect(() => assessWritingSchema.parse(validInput)).not.toThrow()
    })

    it('should reject text that is too short', () => {
      const invalidInput = {
        text: 'Too short'
      }

      expect(() => assessWritingSchema.parse(invalidInput)).toThrow()
    })

    it('should apply default values for optional fields', () => {
      const minimalInput = {
        text: 'This is a long enough text for validation to pass successfully.'
      }

      const result = assessWritingSchema.parse(minimalInput)
      expect(result.type).toBe('essay')
      expect(result.grade_level).toBe('middle')
    })

    it('should reject invalid rubric scores', () => {
      const invalidInput = {
        text: 'This is a valid text length.',
        rubric: {
          content: 120, // Invalid score > 100
          organization: 80,
          language: 75,
          mechanics: 90
        }
      }

      expect(() => assessWritingSchema.parse(invalidInput)).toThrow()
    })
  })

  describe('assembleTestSchema', () => {
    it('should validate correct test assembly input', () => {
      const validInput = {
        item_types: {
          'mcq': 0.6,
          'cloze': 0.3,
          'reading_q': 0.1
        },
        difficulty_distribution: {
          easy: 0.3,
          medium: 0.5,
          hard: 0.2
        },
        total_items: 20,
        cefr_level: 'B1' as const,
        time_limit: 60,
        shuffle: true
      }

      expect(() => assembleTestSchema.parse(validInput)).not.toThrow()
    })

    it('should reject item_types that do not sum to 1.0', () => {
      const invalidInput = {
        item_types: {
          'mcq': 0.6,
          'cloze': 0.3
          // Sum = 0.9, not 1.0
        },
        difficulty_distribution: {
          easy: 0.3,
          medium: 0.5,
          hard: 0.2
        },
        total_items: 20
      }

      expect(() => assembleTestSchema.parse(invalidInput)).toThrow('Item type ratios must sum to 1.0')
    })

    it('should reject difficulty_distribution that does not sum to 1.0', () => {
      const invalidInput = {
        item_types: {
          'mcq': 1.0
        },
        difficulty_distribution: {
          easy: 0.3,
          medium: 0.5,
          hard: 0.3 // Sum = 1.1, not 1.0
        },
        total_items: 20
      }

      expect(() => assembleTestSchema.parse(invalidInput)).toThrow('Difficulty distribution must sum to 1.0')
    })

    it('should handle floating point precision in ratios', () => {
      const validInput = {
        item_types: {
          'mcq': 0.333333,
          'cloze': 0.333333,
          'reading_q': 0.333334 // Sum = 1.000000 (with floating point precision)
        },
        difficulty_distribution: {
          easy: 0.333333,
          medium: 0.333333,
          hard: 0.333334
        },
        total_items: 15
      }

      expect(() => assembleTestSchema.parse(validInput)).not.toThrow()
    })

    it('should apply default value for shuffle', () => {
      const minimalInput = {
        item_types: { 'mcq': 1.0 },
        difficulty_distribution: {
          easy: 0.3,
          medium: 0.5,
          hard: 0.2
        },
        total_items: 10
      }

      const result = assembleTestSchema.parse(minimalInput)
      expect(result.shuffle).toBe(true)
    })

    it('should reject invalid total_items count', () => {
      const invalidInput = {
        item_types: { 'mcq': 1.0 },
        difficulty_distribution: {
          easy: 0.3,
          medium: 0.5,
          hard: 0.2
        },
        total_items: 0 // Invalid
      }

      expect(() => assembleTestSchema.parse(invalidInput)).toThrow()
    })
  })

  describe('Edge Cases and Boundary Values', () => {
    it('should handle exact boundary values', () => {
      const boundaryInputs = [
        {
          schema: generateQuestionsSchema,
          input: { level: 'A1' as const, count: 1 }, // Minimum count
          shouldPass: true
        },
        {
          schema: generateQuestionsSchema,
          input: { level: 'C2' as const, count: 50 }, // Maximum count
          shouldPass: true
        },
        {
          schema: generateLessonPlanSchema,
          input: {
            grade: 'Test',
            subject: 'Test',
            duration: 5, // Minimum duration
            objectives: ['Test']
          },
          shouldPass: true
        },
        {
          schema: generateLessonPlanSchema,
          input: {
            grade: 'Test',
            subject: 'Test',
            duration: 300, // Maximum duration
            objectives: ['Test']
          },
          shouldPass: true
        }
      ]

      boundaryInputs.forEach(({ schema, input, shouldPass }) => {
        if (shouldPass) {
          expect(() => schema.parse(input)).not.toThrow()
        } else {
          expect(() => schema.parse(input)).toThrow()
        }
      })
    })

    it('should handle special characters and unicode', () => {
      const unicodeInput = {
        grade: '七年级',
        subject: 'Español & 中文',
        duration: 45,
        objectives: ['学习目标 #1', 'Objective con acentos: á, é, í, ó, ú']
      }

      expect(() => generateLessonPlanSchema.parse(unicodeInput)).not.toThrow()
    })

    it('should handle very long strings', () => {
      const longText = 'A'.repeat(10000)

      const longTextInput = {
        text: longText
      }

      expect(() => assessWritingSchema.parse(longTextInput)).not.toThrow()
    })
  })
})