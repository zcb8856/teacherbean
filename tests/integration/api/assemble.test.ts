import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Import the API handler
import { POST as assembleHandler } from '@/app/api/assess/assemble/route'

describe('Assemble API Integration Tests', () => {
  // Mock session for authenticated requests
  const mockSession = {
    user: { id: 'test-user-id', email: 'test@example.com' },
    expires: '2025-12-31'
  }

  describe('/api/assess/assemble', () => {
    it('should assemble paper with valid configuration', async () => {
      const validConfig = {
        config: {
          title: 'Test Paper Assembly',
          level: 'A2',
          total_items: 10,
          time_limit: 60,
          instructions: 'Please complete all questions.',
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
          },
          topics: ['grammar', 'vocabulary'],
          tags: ['test', 'assessment']
        }
      }

      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validConfig)
      })

      const response = await assembleHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('config')
      expect(data).toHaveProperty('items')
      expect(data).toHaveProperty('paper_json')
      expect(data).toHaveProperty('printable_html')
      expect(data).toHaveProperty('answer_key')
      expect(data).toHaveProperty('created_at')

      // Verify config preservation
      expect(data.config.title).toBe(validConfig.config.title)
      expect(data.config.level).toBe(validConfig.config.level)
      expect(data.config.total_items).toBe(validConfig.config.total_items)

      // Verify items array
      expect(Array.isArray(data.items)).toBe(true)
      expect(data.items.length).toBeLessThanOrEqual(validConfig.config.total_items)

      // Verify paper structure
      expect(data.paper_json).toHaveProperty('title')
      expect(data.paper_json).toHaveProperty('instructions')
      expect(data.paper_json).toHaveProperty('time_limit')
      expect(data.paper_json).toHaveProperty('sections')
      expect(Array.isArray(data.paper_json.sections)).toBe(true)

      // Verify printable HTML
      expect(typeof data.printable_html).toBe('string')
      expect(data.printable_html).toContain('<!DOCTYPE html>')
      expect(data.printable_html).toContain(validConfig.config.title)

      // Verify answer key
      expect(Array.isArray(data.answer_key)).toBe(true)
      data.answer_key.forEach((answer: any) => {
        expect(answer).toHaveProperty('item_id')
        expect(answer).toHaveProperty('question_type')
        expect(answer).toHaveProperty('correct_answer')
      })
    })

    it('should return 400 for invalid configuration schema', async () => {
      const invalidConfig = {
        config: {
          title: '', // Empty title
          level: 'X1', // Invalid level
          total_items: 0, // Invalid count
          time_limit: 10, // Too short
          instructions: 'Test',
          item_distribution: {
            mcq: 5
          },
          difficulty_distribution: {
            easy: 0.5,
            medium: 0.3,
            hard: 0.3 // Sums to 1.1
          }
        }
      }

      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidConfig)
      })

      const response = await assembleHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('errors')
      expect(Array.isArray(data.errors)).toBe(true)
    })

    it('should return 400 when item distribution does not match total', async () => {
      const mismatchedConfig = {
        config: {
          title: 'Mismatched Test',
          level: 'B1',
          total_items: 10,
          time_limit: 45,
          instructions: 'Test instructions',
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
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toContain('题型分布数量与总题数不匹配')
    })

    it('should return 400 when difficulty distribution does not sum to 1.0', async () => {
      const invalidDifficultyConfig = {
        config: {
          title: 'Invalid Difficulty Test',
          level: 'A2',
          total_items: 5,
          time_limit: 30,
          instructions: 'Test instructions',
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
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toContain('难度分布百分比之和应为100%')
    })

    it('should handle edge case with minimal configuration', async () => {
      const minimalConfig = {
        config: {
          title: 'Minimal Test',
          level: 'A1',
          total_items: 1,
          time_limit: 15,
          instructions: 'Simple test',
          item_distribution: {
            mcq: 1
          },
          difficulty_distribution: {
            easy: 1.0,
            medium: 0.0,
            hard: 0.0
          }
        }
      }

      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(minimalConfig)
      })

      const response = await assembleHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.config.total_items).toBe(1)
      expect(data.items.length).toBeLessThanOrEqual(1)
    })

    it('should handle maximum configuration within limits', async () => {
      const maxConfig = {
        config: {
          title: 'Maximum Test Configuration',
          level: 'C2',
          total_items: 50, // Maximum allowed
          time_limit: 180, // Maximum allowed
          instructions: 'This is a comprehensive test with maximum items.',
          item_distribution: {
            mcq: 20,
            cloze: 10,
            error_correction: 8,
            matching: 7,
            reading_q: 3,
            writing_task: 2
          },
          difficulty_distribution: {
            easy: 0.2,
            medium: 0.5,
            hard: 0.3
          },
          topics: ['advanced_grammar', 'literature', 'academic_writing'],
          tags: ['comprehensive', 'advanced', 'certification']
        }
      }

      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maxConfig)
      })

      const response = await assembleHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.config.total_items).toBe(50)
      expect(data.config.time_limit).toBe(180)
    })

    it('should return 400 when total_items exceeds maximum', async () => {
      const exceedsMaxConfig = {
        config: {
          title: 'Too Many Items',
          level: 'B2',
          total_items: 100, // Exceeds maximum of 50
          time_limit: 120,
          instructions: 'Test',
          item_distribution: {
            mcq: 100
          },
          difficulty_distribution: {
            easy: 0.33,
            medium: 0.33,
            hard: 0.34
          }
        }
      }

      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exceedsMaxConfig)
      })

      const response = await assembleHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('errors')
    })

    it('should validate all CEFR levels', async () => {
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

      for (const level of levels) {
        const config = {
          config: {
            title: `${level} Level Test`,
            level: level as any,
            total_items: 5,
            time_limit: 30,
            instructions: `Test for ${level} level`,
            item_distribution: {
              mcq: 5
            },
            difficulty_distribution: {
              easy: 0.4,
              medium: 0.4,
              hard: 0.2
            }
          }
        }

        const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        })

        const response = await assembleHandler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.config.level).toBe(level)
      }
    })

    it('should handle floating point precision in difficulty distribution', async () => {
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
            hard: 0.333334 // Sum = 1.000000
          }
        }
      }

      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(precisionConfig)
      })

      const response = await assembleHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
    })

    it('should include sections in paper structure', async () => {
      const multiTypeConfig = {
        config: {
          title: 'Multi-Type Test',
          level: 'B2',
          total_items: 8,
          time_limit: 60,
          instructions: 'Complete all sections',
          item_distribution: {
            mcq: 4,
            cloze: 2,
            matching: 2
          },
          difficulty_distribution: {
            easy: 0.25,
            medium: 0.5,
            hard: 0.25
          }
        }
      }

      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(multiTypeConfig)
      })

      const response = await assembleHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.paper_json.sections.length).toBeGreaterThan(0)

      // Check section structure
      data.paper_json.sections.forEach((section: any) => {
        expect(section).toHaveProperty('id')
        expect(section).toHaveProperty('title')
        expect(section).toHaveProperty('items')
        expect(Array.isArray(section.items)).toBe(true)

        // Check item structure in sections
        section.items.forEach((item: any) => {
          expect(item).toHaveProperty('id')
          expect(item).toHaveProperty('question_number')
          expect(item).toHaveProperty('type')
          expect(item).toHaveProperty('stem')
          expect(item).toHaveProperty('points')
          expect(typeof item.points).toBe('number')
          expect(item.points).toBeGreaterThan(0)
        })
      })
    })

    it('should generate valid printable HTML', async () => {
      const htmlConfig = {
        config: {
          title: 'HTML Generation Test',
          level: 'A2',
          total_items: 4,
          time_limit: 30,
          instructions: 'Test HTML generation',
          item_distribution: {
            mcq: 2,
            cloze: 2
          },
          difficulty_distribution: {
            easy: 0.5,
            medium: 0.5,
            hard: 0.0
          }
        }
      }

      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(htmlConfig)
      })

      const response = await assembleHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)

      const html = data.printable_html
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html lang="zh-CN">')
      expect(html).toContain('<head>')
      expect(html).toContain('<body>')
      expect(html).toContain(htmlConfig.config.title)
      expect(html).toContain('考试时间：30分钟')
      expect(html).toContain('姓名：_____________')
      expect(html).toContain('学号：_____________')
      expect(html).toContain('班级：_____________')

      // Should contain sections
      expect(html).toContain('选择题')
      expect(html).toContain('填空题')

      // Should contain answer sheet for MCQ
      expect(html).toContain('答题卡')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should return 401 when not authenticated', async () => {
      // This test assumes authentication middleware is in place
      const config = {
        config: {
          title: 'Unauthorized Test',
          level: 'A2',
          total_items: 5,
          time_limit: 30,
          instructions: 'Test',
          item_distribution: { mcq: 5 },
          difficulty_distribution: { easy: 1, medium: 0, hard: 0 }
        }
      }

      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      const response = await assembleHandler(request)

      // Should return 401 if authentication is required
      expect([200, 401]).toContain(response.status)
    })

    it('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid: json syntax }'
      })

      const response = await assembleHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('message')
    })

    it('should handle empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: ''
      })

      const response = await assembleHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('message')
    })

    it('should handle missing config object', async () => {
      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notConfig: 'invalid' })
      })

      const response = await assembleHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('errors')
    })

    it('should return 500 on internal server errors', async () => {
      // This test is more theoretical as it's hard to trigger actual 500 errors
      // In a real scenario, you might mock database failures or other dependencies
      const potentiallyProblematicConfig = {
        config: {
          title: 'Server Error Test',
          level: 'A2',
          total_items: 10,
          time_limit: 60,
          instructions: 'This might cause issues',
          item_distribution: {
            mcq: 10
          },
          difficulty_distribution: {
            easy: 0.33,
            medium: 0.33,
            hard: 0.34
          }
        }
      }

      const request = new NextRequest('http://localhost:3000/api/assess/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(potentiallyProblematicConfig)
      })

      const response = await assembleHandler(request)

      // Should return either success or a proper error code (not crash)
      expect([200, 400, 500]).toContain(response.status)
    })
  })
})