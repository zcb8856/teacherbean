import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { NextRequest } from 'next/server'

// Import the API handlers
import { POST as lessonHandler } from '@/app/api/generate/lesson/route'
import { POST as itemsHandler } from '@/app/api/generate/items/route'

describe('Generate API Integration Tests', () => {
  // Mock session for authenticated requests
  const mockSession = {
    user: { id: 'test-user-id', email: 'test@example.com' },
    expires: '2025-12-31'
  }

  describe('/api/generate/lesson-plan', () => {
    it('should generate lesson plan with valid input', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/generate/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validInput)
      })

      const response = await lessonPlanHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('title')
      expect(data).toHaveProperty('grade', validInput.grade)
      expect(data).toHaveProperty('subject', validInput.subject)
      expect(data).toHaveProperty('duration', validInput.duration)
      expect(data.objectives).toEqual(validInput.objectives)
      expect(data).toHaveProperty('content')
      expect(data).toHaveProperty('created_at')
    })

    it('should return 400 for invalid input data', async () => {
      const invalidInput = {
        grade: '', // Empty grade
        subject: 'Food & Health',
        duration: 45,
        objectives: [] // Empty objectives
      }

      const request = new NextRequest('http://localhost:3000/api/generate/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidInput)
      })

      const response = await lessonPlanHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('errors')
      expect(Array.isArray(data.errors)).toBe(true)
    })

    it('should return 400 for missing required fields', async () => {
      const incompleteInput = {
        grade: '七年级',
        // Missing subject, duration, objectives
      }

      const request = new NextRequest('http://localhost:3000/api/generate/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteInput)
      })

      const response = await lessonPlanHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('errors')
      expect(data.errors.length).toBeGreaterThan(0)
    })

    it('should return 400 for duration out of range', async () => {
      const invalidDurationInput = {
        grade: '七年级',
        subject: 'Test Subject',
        duration: 400, // Exceeds maximum
        objectives: ['Test objective']
      }

      const request = new NextRequest('http://localhost:3000/api/generate/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidDurationInput)
      })

      const response = await lessonPlanHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('errors')
      expect(data.errors.some((err: any) => err.message.includes('Duration'))).toBe(true)
    })

    it('should handle optional fields correctly', async () => {
      const minimalInput = {
        grade: '八年级',
        subject: 'Minimal Test',
        duration: 30,
        objectives: ['Basic objective']
      }

      const request = new NextRequest('http://localhost:3000/api/generate/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minimalInput)
      })

      const response = await lessonPlanHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.vocabulary).toBeUndefined()
      expect(data.activities).toBeUndefined()
    })

    it('should return 400 for malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json }'
      })

      const response = await lessonPlanHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('message')
    })
  })

  describe('/api/generate/questions', () => {
    it('should generate questions with valid input', async () => {
      const validInput = {
        level: 'A2',
        count: 10,
        type: 'mcq',
        topic: 'present simple',
        difficulty: 0.5
      }

      const request = new NextRequest('http://localhost:3000/api/generate/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validInput)
      })

      const response = await questionsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('questions')
      expect(Array.isArray(data.questions)).toBe(true)
      expect(data.questions).toHaveLength(validInput.count)
      expect(data).toHaveProperty('level', validInput.level)
      expect(data).toHaveProperty('type', validInput.type)
      expect(data).toHaveProperty('generated_at')

      // Check individual question structure
      data.questions.forEach((question: any) => {
        expect(question).toHaveProperty('id')
        expect(question).toHaveProperty('stem')
        expect(question).toHaveProperty('type', 'mcq')
        if (question.type === 'mcq') {
          expect(question).toHaveProperty('options')
          expect(Array.isArray(question.options)).toBe(true)
          expect(question.options.length).toBeGreaterThanOrEqual(2)
        }
        expect(question).toHaveProperty('answer')
        expect(question).toHaveProperty('difficulty_score')
        expect(question.difficulty_score).toBeGreaterThanOrEqual(0)
        expect(question.difficulty_score).toBeLessThanOrEqual(1)
      })
    })

    it('should handle all CEFR levels', async () => {
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

      for (const level of levels) {
        const input = {
          level: level as any,
          count: 3
        }

        const request = new NextRequest('http://localhost:3000/api/generate/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        })

        const response = await questionsHandler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.level).toBe(level)
        expect(data.questions).toHaveLength(3)
      }
    })

    it('should handle all question types', async () => {
      const questionTypes = ['mcq', 'cloze', 'error_correction', 'matching', 'reading_q', 'writing_task']

      for (const type of questionTypes) {
        const input = {
          level: 'B1' as any,
          count: 2,
          type: type as any
        }

        const request = new NextRequest('http://localhost:3000/api/generate/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        })

        const response = await questionsHandler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.type).toBe(type)
        expect(data.questions).toHaveLength(2)

        // Verify question structure based on type
        data.questions.forEach((question: any) => {
          expect(question.type).toBe(type)

          switch (type) {
            case 'mcq':
              expect(question.options).toBeDefined()
              expect(Array.isArray(question.options)).toBe(true)
              break
            case 'cloze':
              expect(question.stem).toContain('___')
              break
            case 'matching':
              expect(question).toHaveProperty('left_items')
              expect(question).toHaveProperty('right_items')
              break
          }
        })
      }
    })

    it('should return 400 for invalid CEFR level', async () => {
      const invalidInput = {
        level: 'X1', // Invalid level
        count: 5
      }

      const request = new NextRequest('http://localhost:3000/api/generate/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidInput)
      })

      const response = await questionsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('errors')
    })

    it('should return 400 for count out of range', async () => {
      const invalidCountInputs = [
        { level: 'A2', count: 0 }, // Too low
        { level: 'A2', count: 100 }, // Too high
        { level: 'A2', count: -5 } // Negative
      ]

      for (const input of invalidCountInputs) {
        const request = new NextRequest('http://localhost:3000/api/generate/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        })

        const response = await questionsHandler(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data).toHaveProperty('errors')
      }
    })

    it('should handle optional parameters correctly', async () => {
      const minimalInput = {
        level: 'B2' as any,
        count: 5
      }

      const request = new NextRequest('http://localhost:3000/api/generate/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minimalInput)
      })

      const response = await questionsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.questions).toHaveLength(5)
      expect(data.type).toBeUndefined()
      expect(data.topic).toBeUndefined()
      expect(data.difficulty).toBeUndefined()
    })

    it('should respect difficulty parameter when provided', async () => {
      const easyInput = {
        level: 'A2' as any,
        count: 5,
        difficulty: 0.2 // Easy questions
      }

      const request = new NextRequest('http://localhost:3000/api/generate/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(easyInput)
      })

      const response = await questionsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.questions).toHaveLength(5)

      // Check that generated questions are relatively easy
      const avgDifficulty = data.questions.reduce((sum: number, q: any) => sum + q.difficulty_score, 0) / data.questions.length
      expect(avgDifficulty).toBeLessThan(0.5) // Should be easier than medium
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle unsupported HTTP methods', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate/lesson-plan', {
        method: 'GET' // Unsupported method
      })

      const response = await lessonPlanHandler(request)
      expect(response.status).toBe(405) // Method Not Allowed
    })

    it('should handle missing Content-Type header', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate/lesson-plan', {
        method: 'POST',
        body: JSON.stringify({ grade: 'test' })
      })

      const response = await lessonPlanHandler(request)
      const data = await response.json()

      // Should still work or return appropriate error
      expect([200, 400, 415]).toContain(response.status)
    })

    it('should handle empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: ''
      })

      const response = await questionsHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('message')
    })

    it('should handle very large request payloads gracefully', async () => {
      const largeObjectives = Array.from({ length: 1000 }, (_, i) => `Objective ${i}`)
      const largeInput = {
        grade: '九年级',
        subject: 'Large Test',
        duration: 60,
        objectives: largeObjectives
      }

      const request = new NextRequest('http://localhost:3000/api/generate/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(largeInput)
      })

      const response = await lessonPlanHandler(request)

      // Should either succeed or return an appropriate error (not crash)
      expect([200, 400, 413, 500]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data.objectives).toHaveLength(1000)
      }
    })
  })
})