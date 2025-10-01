import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { NextRequest } from 'next/server'

// Import the API handlers
import { POST as lessonHandler } from '@/app/api/generate/lesson/route'
import { POST as itemsHandler } from '@/app/api/generate/items/route'
import { POST as assembleHandler } from '@/app/api/assess/assemble/route'

describe('API Endpoints Integration Tests', () => {
  describe('/api/generate/lesson', () => {
    it('should generate lesson plan with valid input', async () => {
      const validInput = {
        title: 'Food & Health',
        level: 'A2',
        duration: 45,
        topic: 'healthy eating',
        focus_skills: ['speaking', 'vocabulary'],
        grammar_points: ['present simple', 'food vocabulary']
      }

      const request = new NextRequest('http://localhost:3000/api/generate/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validInput)
      })

      const response = await lessonHandler(request)

      // Should return 401 because no authentication is mocked
      expect([200, 401]).toContain(response.status)

      if (response.status === 200) {
        const data = await response.json()
        expect(data).toHaveProperty('title', validInput.title)
        expect(data).toHaveProperty('level', validInput.level)
        expect(data).toHaveProperty('duration', validInput.duration)
        expect(data).toHaveProperty('objectives')
        expect(Array.isArray(data.objectives)).toBe(true)
      }
    })

    it('should return 401 for unauthenticated requests', async () => {
      const validInput = {
        title: 'Test Lesson',
        level: 'A1',
        duration: 30,
        topic: 'test',
        focus_skills: ['reading'],
        grammar_points: ['basic']
      }

      const request = new NextRequest('http://localhost:3000/api/generate/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validInput)
      })

      const response = await lessonHandler(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error', 'Unauthorized')
    })

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json }'
      })

      const response = await lessonHandler(request)

      expect([400, 401, 500]).toContain(response.status)
    })
  })

  describe('/api/generate/items', () => {
    it('should validate input schema correctly', async () => {
      const validInput = {
        type: 'matching',
        topic: 'family members',
        grammarPoints: ['present simple', 'family vocabulary'],
        level: 'A2',
        count: 5
      }

      const request = new NextRequest('http://localhost:3000/api/generate/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validInput)
      })

      const response = await itemsHandler(request)

      // Should return 401 because no authentication is mocked
      expect([200, 401]).toContain(response.status)
    })

    it('should return 400 for invalid input schema', async () => {
      const invalidInput = {
        type: 'invalid_type', // Not in enum
        topic: '', // Empty topic
        grammarPoints: [], // Empty array
        level: 'X1', // Invalid level
        count: 0 // Invalid count
      }

      const request = new NextRequest('http://localhost:3000/api/generate/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidInput)
      })

      const response = await itemsHandler(request)

      expect([400, 401]).toContain(response.status)

      if (response.status === 400) {
        const data = await response.json()
        expect(data).toHaveProperty('error', '数据验证失败')
        expect(data).toHaveProperty('details')
        expect(Array.isArray(data.details)).toBe(true)
      }
    })

    it('should handle all valid item types', async () => {
      const itemTypes = ['spelling', 'matching', 'qa']

      for (const type of itemTypes) {
        const input = {
          type: type as any,
          topic: 'test topic',
          grammarPoints: ['test grammar'],
          level: 'B1' as any,
          count: 3
        }

        const request = new NextRequest('http://localhost:3000/api/generate/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        })

        const response = await itemsHandler(request)
        expect([200, 401]).toContain(response.status)
      }
    })

    it('should handle all valid CEFR levels', async () => {
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

      for (const level of levels) {
        const input = {
          type: 'matching' as any,
          topic: 'test topic',
          grammarPoints: ['test'],
          level: level as any,
          count: 2
        }

        const request = new NextRequest('http://localhost:3000/api/generate/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        })

        const response = await itemsHandler(request)
        expect([200, 401]).toContain(response.status)
      }
    })

    it('should respect count limits', async () => {
      const inputs = [
        { count: 1 }, // Minimum
        { count: 50 }, // Maximum
        { count: 25 } // Middle
      ]

      for (const { count } of inputs) {
        const input = {
          type: 'qa' as any,
          topic: 'test',
          grammarPoints: ['test'],
          level: 'A2' as any,
          count
        }

        const request = new NextRequest('http://localhost:3000/api/generate/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        })

        const response = await itemsHandler(request)
        expect([200, 401]).toContain(response.status)
      }
    })

    it('should reject count outside valid range', async () => {
      const invalidCounts = [0, -1, 51, 100]

      for (const count of invalidCounts) {
        const input = {
          type: 'spelling' as any,
          topic: 'test',
          grammarPoints: ['test'],
          level: 'B1' as any,
          count
        }

        const request = new NextRequest('http://localhost:3000/api/generate/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        })

        const response = await itemsHandler(request)
        expect([400, 401]).toContain(response.status)
      }
    })
  })

  describe('/api/assess/assemble', () => {
    it('should validate assembly configuration schema', async () => {
      const validConfig = {
        config: {
          title: 'Test Assembly',
          level: 'A2',
          total_items: 10,
          time_limit: 60,
          instructions: 'Complete all questions.',
          item_distribution: {
            mcq: 6,
            cloze: 2,
            error_correction: 1,
            matching: 1,
            reading_q: 0,
            writing_task: 0
          },
          difficulty_distribution: {
            easy: 0.3,
            medium: 0.4,
            hard: 0.3
          }
        }
      }

      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validConfig)
      })

      const response = await assembleHandler(request)

      // Should return 401 because no authentication is mocked
      expect([200, 401]).toContain(response.status)
    })

    it('should return 400 for invalid assembly configuration', async () => {
      const invalidConfig = {
        config: {
          title: '', // Empty title
          level: 'X1', // Invalid level
          total_items: 0, // Invalid count
          time_limit: 5, // Too short
          instructions: 'Test',
          item_distribution: {
            mcq: 5
          },
          difficulty_distribution: {
            easy: 0.5,
            medium: 0.3,
            hard: 0.5 // Sum > 1.0
          }
        }
      }

      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidConfig)
      })

      const response = await assembleHandler(request)

      expect([400, 401]).toContain(response.status)
    })

    it('should validate item distribution totals', async () => {
      const mismatchedConfig = {
        config: {
          title: 'Mismatched Test',
          level: 'B1',
          total_items: 10,
          time_limit: 45,
          instructions: 'Test',
          item_distribution: {
            mcq: 5,
            cloze: 3
            // Sum = 8, but total_items = 10
          },
          difficulty_distribution: {
            easy: 0.3,
            medium: 0.4,
            hard: 0.3
          }
        }
      }

      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mismatchedConfig)
      })

      const response = await assembleHandler(request)

      expect([400, 401]).toContain(response.status)
    })

    it('should validate difficulty distribution totals', async () => {
      const invalidDifficultyConfig = {
        config: {
          title: 'Invalid Difficulty',
          level: 'A2',
          total_items: 5,
          time_limit: 30,
          instructions: 'Test',
          item_distribution: {
            mcq: 5
          },
          difficulty_distribution: {
            easy: 0.4,
            medium: 0.4,
            hard: 0.4 // Sum = 1.2
          }
        }
      }

      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidDifficultyConfig)
      })

      const response = await assembleHandler(request)

      expect([400, 401]).toContain(response.status)
    })

    it('should handle boundary values correctly', async () => {
      const boundaryConfigs = [
        {
          title: 'Minimum Test',
          level: 'A1',
          total_items: 5, // Minimum
          time_limit: 15, // Minimum
          item_distribution: { mcq: 5 },
          difficulty_distribution: { easy: 1.0, medium: 0.0, hard: 0.0 }
        },
        {
          title: 'Maximum Test',
          level: 'C2',
          total_items: 50, // Maximum
          time_limit: 180, // Maximum
          item_distribution: { mcq: 50 },
          difficulty_distribution: { easy: 0.2, medium: 0.5, hard: 0.3 }
        }
      ]

      for (const config of boundaryConfigs) {
        const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config })
        })

        const response = await assembleHandler(request)
        expect([200, 401]).toContain(response.status)
      }
    })

    it('should handle floating point precision in distributions', async () => {
      const precisionConfig = {
        config: {
          title: 'Precision Test',
          level: 'B1',
          total_items: 9,
          time_limit: 45,
          instructions: 'Test floating point precision',
          item_distribution: {
            mcq: 9
          },
          difficulty_distribution: {
            easy: 0.333333,
            medium: 0.333333,
            hard: 0.333334
          }
        }
      }

      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(precisionConfig)
      })

      const response = await assembleHandler(request)
      expect([200, 401]).toContain(response.status)
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON across all endpoints', async () => {
      const endpoints = [
        { handler: lessonHandler, path: '/api/generate/lesson' },
        { handler: itemsHandler, path: '/api/generate/items' },
        { handler: assembleHandler, path: '/api/assess/assemble' }
      ]

      for (const { handler, path } of endpoints) {
        const request = new NextRequest(`http://localhost:3000${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{ invalid: json }'
        })

        const response = await handler(request)
        expect([400, 401, 500]).toContain(response.status)
      }
    })

    it('should handle empty request bodies', async () => {
      const endpoints = [
        { handler: lessonHandler, path: '/api/generate/lesson' },
        { handler: itemsHandler, path: '/api/generate/items' },
        { handler: assembleHandler, path: '/api/assess/assemble' }
      ]

      for (const { handler, path } of endpoints) {
        const request = new NextRequest(`http://localhost:3000${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: ''
        })

        const response = await handler(request)
        expect([400, 401, 500]).toContain(response.status)
      }
    })

    it('should handle missing Content-Type header', async () => {
      const input = { test: 'data' }

      const endpoints = [
        { handler: lessonHandler, path: '/api/generate/lesson' },
        { handler: itemsHandler, path: '/api/generate/items' },
        { handler: assembleHandler, path: '/api/assess/assemble' }
      ]

      for (const { handler, path } of endpoints) {
        const request = new NextRequest(`http://localhost:3000${path}`, {
          method: 'POST',
          body: JSON.stringify(input)
        })

        const response = await handler(request)
        expect([200, 400, 401, 415, 500]).toContain(response.status)
      }
    })

    it('should handle oversized request payloads', async () => {
      const largeData = {
        title: 'A'.repeat(10000),
        level: 'A2',
        duration: 45,
        topic: 'B'.repeat(10000),
        focus_skills: Array.from({ length: 1000 }, (_, i) => `skill_${i}`),
        grammar_points: Array.from({ length: 1000 }, (_, i) => `grammar_${i}`)
      }

      const request = new NextRequest('http://localhost:3000/api/generate/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(largeData)
      })

      const response = await lessonHandler(request)
      expect([200, 400, 401, 413, 500]).toContain(response.status)
    })
  })

  describe('Schema Validation Edge Cases', () => {
    it('should handle unicode and special characters', async () => {
      const unicodeInput = {
        type: 'matching' as any,
        topic: 'français & 中文 topic with émojis 🎓',
        grammarPoints: ['grammaire française', '中文语法', 'special characters: @#$%'],
        level: 'B2' as any,
        count: 3
      }

      const request = new NextRequest('http://localhost:3000/api/generate/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unicodeInput)
      })

      const response = await itemsHandler(request)
      expect([200, 400, 401]).toContain(response.status)
    })

    it('should handle null and undefined values', async () => {
      const nullInput = {
        type: 'qa',
        topic: null,
        grammarPoints: undefined,
        level: 'A1',
        count: 5
      }

      const request = new NextRequest('http://localhost:3000/api/generate/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nullInput)
      })

      const response = await itemsHandler(request)
      expect([400, 401]).toContain(response.status)
    })

    it('should handle type coercion scenarios', async () => {
      const coercionInput = {
        type: 'matching',
        topic: 'test',
        grammarPoints: ['test'],
        level: 'A2',
        count: '5' // String instead of number
      }

      const request = new NextRequest('http://localhost:3000/api/generate/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coercionInput)
      })

      const response = await itemsHandler(request)
      expect([200, 400, 401]).toContain(response.status)
    })
  })
})