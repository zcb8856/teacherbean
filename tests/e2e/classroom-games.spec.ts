import { test, expect } from '@playwright/test'
import { ensureAuthenticated, testUsers } from '../fixtures/auth'
import { TestHelpers } from '../utils/test-helpers'
import { grammarTopics, mockAIResponses } from '../fixtures/test-data'

test.describe('Classroom Grammar Games E2E Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await ensureAuthenticated(page, testUsers.teacher1)
  })

  test('在 /classroom 生成 10 道 A2 级语法小题并完成"一分钟小游戏"演示', async ({ page }) => {
    // Step 1: Navigate to classroom page
    await test.step('导航到课堂互动页面', async () => {
      await helpers.navigateToPage('/classroom', '[data-testid="classroom-page"]')
      await expect(page.locator('h1')).toContainText('课堂互动')
    })

    // Step 2: Set up grammar game parameters
    await test.step('设置语法游戏参数', async () => {
      // Select game type
      await page.selectOption('[data-testid="game-type-select"]', 'grammar-quiz')

      // Set difficulty level
      await page.selectOption('[data-testid="difficulty-level"]', 'A2')

      // Select grammar topic
      await page.selectOption('[data-testid="grammar-topic"]', 'Present Simple vs Present Continuous')

      // Set number of questions
      await helpers.fillField('[data-testid="question-count"]', '10')

      // Set game duration
      await helpers.fillField('[data-testid="game-duration"]', '1')

      // Enable quick mode for demo
      await page.check('[data-testid="quick-mode"]')

      // Verify settings are applied
      await expect(page.locator('[data-testid="game-settings-summary"]')).toContainText('A2级语法小题')
      await expect(page.locator('[data-testid="game-settings-summary"]')).toContainText('10道题目')
      await expect(page.locator('[data-testid="game-settings-summary"]')).toContainText('1分钟')
    })

    // Step 3: Mock AI question generation
    await test.step('模拟AI生成语法题目', async () => {
      const mockQuestions = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        type: 'mcq',
        question: mockAIResponses.grammarQuestions[i % 2].question.replace(/\d+/, `${i + 1}`),
        options: mockAIResponses.grammarQuestions[i % 2].options,
        correct: mockAIResponses.grammarQuestions[i % 2].correct,
        explanation: mockAIResponses.grammarQuestions[i % 2].explanation,
        level: 'A2',
        topic: 'Present Simple vs Present Continuous'
      }))

      await helpers.mockAPIResponse(
        /\/api\/ai\/generate-questions/,
        {
          questions: mockQuestions,
          total: 10,
          level: 'A2',
          topic: 'Present Simple vs Present Continuous'
        }
      )
    })

    // Step 4: Generate questions
    await test.step('生成语法题目', async () => {
      await helpers.clickAndWait('[data-testid="generate-questions"]', '[data-testid="questions-preview"]')

      await helpers.waitForLoading()

      // Verify questions are generated
      await expect(page.locator('[data-testid="questions-count"]')).toContainText('10道题目')
      await expect(page.locator('[data-testid="questions-preview"]')).toBeVisible()

      // Check first few questions are displayed
      for (let i = 1; i <= 3; i++) {
        await expect(page.locator(`[data-testid="question-${i}"]`)).toBeVisible()
        await expect(page.locator(`[data-testid="question-${i}-stem"]`)).toContainText('_____')
      }
    })

    // Step 5: Review and adjust questions if needed
    await test.step('预览和调整题目', async () => {
      // Click to expand all questions for review
      await helpers.clickAndWait('[data-testid="expand-all-questions"]')

      // Verify all questions are visible
      for (let i = 1; i <= 10; i++) {
        await expect(page.locator(`[data-testid="question-${i}"]`)).toBeVisible()
      }

      // Edit a question to demonstrate editing capability
      await helpers.clickAndWait('[data-testid="edit-question-1"]', '[data-testid="question-editor"]')
      await helpers.fillField('[data-testid="question-stem"]', 'She always _______ to school by bus.')
      await helpers.clickAndWait('[data-testid="save-question"]')

      // Verify edit was saved
      await expect(page.locator('[data-testid="question-1-stem"]')).toContainText('She always _______ to school by bus.')
    })

    // Step 6: Start the game demo
    await test.step('开始游戏演示', async () => {
      await helpers.clickAndWait('[data-testid="start-game"]', '[data-testid="game-interface"]')

      // Verify game interface elements
      await expect(page.locator('[data-testid="game-timer"]')).toBeVisible()
      await expect(page.locator('[data-testid="game-score"]')).toContainText('0')
      await expect(page.locator('[data-testid="question-counter"]')).toContainText('1 / 10')

      // Verify first question is displayed
      await expect(page.locator('[data-testid="current-question"]')).toBeVisible()
      await expect(page.locator('[data-testid="answer-options"]')).toBeVisible()
    })

    // Step 7: Simulate answering questions in demo mode
    await test.step('模拟答题过程', async () => {
      let score = 0

      for (let i = 1; i <= 10; i++) {
        // Verify current question number
        await expect(page.locator('[data-testid="question-counter"]')).toContainText(`${i} / 10`)

        // Get available options
        const options = page.locator('[data-testid="answer-option"]')
        const optionCount = await options.count()

        // Simulate choosing answer (mix of correct and incorrect for realism)
        const isCorrect = Math.random() > 0.3 // 70% correct rate
        const optionIndex = isCorrect ? 0 : Math.floor(Math.random() * optionCount)

        await options.nth(optionIndex).click()

        // Wait for feedback
        await helpers.waitForElement('[data-testid="answer-feedback"]')

        if (isCorrect) {
          score++
          await expect(page.locator('[data-testid="answer-feedback"]')).toContainText('正确')
          await expect(page.locator('[data-testid="game-score"]')).toContainText(score.toString())
        } else {
          await expect(page.locator('[data-testid="answer-feedback"]')).toContainText('错误')
        }

        // Continue to next question (unless it's the last one)
        if (i < 10) {
          await helpers.clickAndWait('[data-testid="next-question"]')
        }

        // Add small delay to make it realistic
        await page.waitForTimeout(500)
      }

      // Verify final score is displayed
      await expect(page.locator('[data-testid="game-score"]')).toContainText(score.toString())
    })

    // Step 8: View game results
    await test.step('查看游戏结果', async () => {
      // Game should auto-complete after 10 questions or 1 minute timer
      await helpers.waitForElement('[data-testid="game-results"]')

      // Verify results screen
      await expect(page.locator('[data-testid="final-score"]')).toBeVisible()
      await expect(page.locator('[data-testid="accuracy-rate"]')).toBeVisible()
      await expect(page.locator('[data-testid="time-taken"]')).toBeVisible()

      // Check performance breakdown
      await expect(page.locator('[data-testid="correct-answers"]')).toBeVisible()
      await expect(page.locator('[data-testid="incorrect-answers"]')).toBeVisible()

      // Verify question review is available
      await expect(page.locator('[data-testid="review-answers"]')).toBeVisible()
    })

    // Step 9: Review incorrect answers
    await test.step('回顾错误答案', async () => {
      await helpers.clickAndWait('[data-testid="review-answers"]', '[data-testid="answer-review"]')

      // Check that incorrect answers are highlighted
      const incorrectAnswers = page.locator('[data-testid="incorrect-answer"]')
      const incorrectCount = await incorrectAnswers.count()

      if (incorrectCount > 0) {
        // Review first incorrect answer
        await incorrectAnswers.first().click()

        // Verify explanation is shown
        await expect(page.locator('[data-testid="answer-explanation"]')).toBeVisible()
        await expect(page.locator('[data-testid="correct-answer-highlight"]')).toBeVisible()
      }
    })

    // Step 10: Save game results (optional)
    await test.step('保存游戏结果', async () => {
      // Mock save results API
      await helpers.mockAPIResponse(
        /\/api\/classroom\/save-results/,
        {
          message: 'Game results saved successfully',
          result_id: 'game-result-123'
        }
      )

      await helpers.clickAndWait('[data-testid="save-results"]')
      await helpers.verifyToast('游戏结果已保存')
    })

    // Step 11: Start a new game
    await test.step('开始新游戏', async () => {
      await helpers.clickAndWait('[data-testid="play-again"]', '[data-testid="game-setup"]')

      // Verify we're back to setup screen
      await expect(page.locator('[data-testid="game-type-select"]')).toBeVisible()
      await expect(page.locator('[data-testid="difficulty-level"]')).toBeVisible()
    })
  })

  test('测试不同游戏模式和设置', async ({ page }) => {
    await test.step('测试团队对战模式', async () => {
      await helpers.navigateToPage('/classroom', '[data-testid="classroom-page"]')

      // Set up team battle mode
      await page.selectOption('[data-testid="game-type-select"]', 'team-battle')
      await helpers.fillField('[data-testid="team-count"]', '2')
      await helpers.fillField('[data-testid="questions-per-team"]', '5')

      // Mock team setup
      await helpers.mockAPIResponse(
        /\/api\/classroom\/setup-teams/,
        {
          teams: [
            { id: 'team-1', name: '红队', members: ['张三', '李四'] },
            { id: 'team-2', name: '蓝队', members: ['王五', '赵六'] }
          ]
        }
      )

      await helpers.clickAndWait('[data-testid="setup-teams"]', '[data-testid="team-setup"]')

      // Verify teams are created
      await expect(page.locator('[data-testid="team-1"]')).toContainText('红队')
      await expect(page.locator('[data-testid="team-2"]')).toContainText('蓝队')
    })

    await test.step('测试快速练习模式', async () => {
      await page.selectOption('[data-testid="game-type-select"]', 'quick-practice')
      await page.selectOption('[data-testid="practice-focus"]', 'verb-tenses')

      // Set adaptive difficulty
      await page.check('[data-testid="adaptive-difficulty"]')

      await helpers.mockAPIResponse(
        /\/api\/ai\/generate-adaptive-questions/,
        { questions: mockAIResponses.grammarQuestions.slice(0, 5) }
      )

      await helpers.clickAndWait('[data-testid="start-practice"]', '[data-testid="practice-interface"]')

      // Verify adaptive mode is active
      await expect(page.locator('[data-testid="adaptive-mode-indicator"]')).toBeVisible()
    })
  })

  test('验证游戏数据统计和分析', async ({ page }) => {
    await test.step('查看游戏统计', async () => {
      await helpers.navigateToPage('/classroom', '[data-testid="classroom-page"]')

      // Navigate to statistics tab
      await helpers.clickAndWait('[data-testid="statistics-tab"]', '[data-testid="game-statistics"]')

      // Mock statistics data
      await helpers.mockAPIResponse(
        /\/api\/classroom\/statistics/,
        {
          totalGamesPlayed: 25,
          averageScore: 78.5,
          mostDifficultTopics: ['Past Perfect', 'Conditional Sentences'],
          studentProgress: [
            { student: '张三', improvement: 15, lastScore: 85 },
            { student: '李四', improvement: 8, lastScore: 72 }
          ]
        }
      )

      await helpers.waitForLoading()

      // Verify statistics are displayed
      await expect(page.locator('[data-testid="total-games"]')).toContainText('25')
      await expect(page.locator('[data-testid="average-score"]')).toContainText('78.5')
      await expect(page.locator('[data-testid="difficult-topics"]')).toContainText('Past Perfect')
    })

    await test.step('导出游戏数据', async () => {
      // Mock export API
      await helpers.mockAPIResponse(
        /\/api\/classroom\/export-statistics/,
        { download_url: '/api/download/classroom-stats.csv' }
      )

      await helpers.clickAndWait('[data-testid="export-statistics"]')
      await helpers.verifyToast('统计数据导出成功')
    })
  })

  test('验证错误处理和边界情况', async ({ page }) => {
    await test.step('测试网络错误处理', async () => {
      await helpers.navigateToPage('/classroom', '[data-testid="classroom-page"]')

      await page.selectOption('[data-testid="game-type-select"]', 'grammar-quiz')
      await page.selectOption('[data-testid="difficulty-level"]', 'A2')

      // Mock network error
      await helpers.mockAPIResponse(
        /\/api\/ai\/generate-questions/,
        { error: 'Network timeout' },
        500
      )

      await helpers.clickAndWait('[data-testid="generate-questions"]')
      await helpers.verifyToast('题目生成失败，请检查网络连接', 'error')
    })

    await test.step('测试无效参数处理', async () => {
      // Try to set invalid question count
      await helpers.fillField('[data-testid="question-count"]', '0')
      await helpers.clickAndWait('[data-testid="generate-questions"]')

      // Verify validation error
      await expect(page.locator('[data-testid="error-question-count"]')).toContainText('题目数量必须大于0')
    })

    await test.step('测试游戏中断恢复', async () => {
      // Start a game
      await helpers.fillField('[data-testid="question-count"]', '5')
      await helpers.mockAPIResponse(/\/api\/ai\/generate-questions/, { questions: mockAIResponses.grammarQuestions })

      await helpers.clickAndWait('[data-testid="generate-questions"]', '[data-testid="questions-preview"]')
      await helpers.clickAndWait('[data-testid="start-game"]', '[data-testid="game-interface"]')

      // Simulate interruption (e.g., browser refresh would be tested differently)
      await helpers.clickAndWait('[data-testid="pause-game"]', '[data-testid="game-paused"]')

      // Resume game
      await helpers.clickAndWait('[data-testid="resume-game"]', '[data-testid="game-interface"]')

      // Verify game state is preserved
      await expect(page.locator('[data-testid="current-question"]')).toBeVisible()
    })
  })
})