import { test, expect } from '@playwright/test'
import { ensureAuthenticated, testUsers } from '../fixtures/auth'
import { TestHelpers } from '../utils/test-helpers'
import { sampleEssay, rubricCriteria, mockAIResponses } from '../fixtures/test-data'

test.describe('Writing Assessment E2E Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await ensureAuthenticated(page, testUsers.teacher1)
  })

  test('在 /writing 粘贴作文，获取 rubric 与改写稿，并导出讲评 Docx', async ({ page }) => {
    // Step 1: Navigate to writing assessment page
    await test.step('导航到写作评改页面', async () => {
      await helpers.navigateToPage('/writing', '[data-testid="writing-page"]')
      await expect(page.locator('h1')).toContainText('写作评改')
    })

    // Step 2: Set up assessment parameters
    await test.step('设置评改参数', async () => {
      // Select assessment type
      await page.selectOption('[data-testid="assessment-type"]', 'essay')

      // Select grade level
      await page.selectOption('[data-testid="grade-level"]', 'middle-school')

      // Select writing type
      await page.selectOption('[data-testid="writing-type"]', 'descriptive')

      // Configure rubric criteria
      await helpers.clickAndWait('[data-testid="configure-rubric"]', '[data-testid="rubric-config"]')

      // Set rubric weights
      await helpers.fillField('[data-testid="content-weight"]', rubricCriteria.content.weight.toString())
      await helpers.fillField('[data-testid="organization-weight"]', rubricCriteria.organization.weight.toString())
      await helpers.fillField('[data-testid="language-weight"]', rubricCriteria.language.weight.toString())
      await helpers.fillField('[data-testid="mechanics-weight"]', rubricCriteria.mechanics.weight.toString())

      await helpers.clickAndWait('[data-testid="save-rubric-config"]')

      // Verify rubric configuration is saved
      await expect(page.locator('[data-testid="rubric-summary"]')).toContainText('内容: 30%')
      await expect(page.locator('[data-testid="rubric-summary"]')).toContainText('结构: 25%')
    })

    // Step 3: Input student essay
    await test.step('输入学生作文', async () => {
      // Paste sample essay
      await helpers.fillField('[data-testid="essay-input"]', sampleEssay)

      // Add student information
      await helpers.fillField('[data-testid="student-name"]', '张小明')
      await helpers.fillField('[data-testid="student-id"]', 'S2024001')
      await helpers.fillField('[data-testid="assignment-title"]', 'My Favorite Season - 描述文写作')

      // Verify word count is calculated
      await expect(page.locator('[data-testid="word-count"]')).toContainText('153') // Approximate word count
      await expect(page.locator('[data-testid="character-count"]')).toBeVisible()
    })

    // Step 4: Mock AI assessment response
    await test.step('模拟AI评改响应', async () => {
      await helpers.mockAPIResponse(
        /\/api\/ai\/assess-writing/,
        mockAIResponses.writingFeedback
      )
    })

    // Step 5: Start AI assessment
    await test.step('开始AI评改', async () => {
      await helpers.clickAndWait('[data-testid="start-assessment"]', '[data-testid="assessment-loading"]')

      // Wait for assessment to complete
      await helpers.waitForLoading()

      // Verify assessment results appear
      await expect(page.locator('[data-testid="assessment-results"]')).toBeVisible()
    })

    // Step 6: Review assessment results
    await test.step('查看评改结果', async () => {
      // Check overall score
      await expect(page.locator('[data-testid="overall-score"]')).toContainText('82')

      // Check individual rubric scores
      await expect(page.locator('[data-testid="content-score"]')).toContainText('85')
      await expect(page.locator('[data-testid="organization-score"]')).toContainText('80')
      await expect(page.locator('[data-testid="language-score"]')).toContainText('78')
      await expect(page.locator('[data-testid="mechanics-score"]')).toContainText('85')

      // Verify strengths are displayed
      const strengthsList = page.locator('[data-testid="strengths-list"]')
      await expect(strengthsList).toContainText('文章结构清晰')
      await expect(strengthsList).toContainText('使用了丰富的形容词')

      // Verify improvement suggestions
      const improvementsList = page.locator('[data-testid="improvements-list"]')
      await expect(improvementsList).toContainText('可以使用更多高级词汇')
      await expect(improvementsList).toContainText('句型可以更加多样化')
    })

    // Step 7: View improved version
    await test.step('查看改写稿', async () => {
      await helpers.clickAndWait('[data-testid="view-improved-version"]', '[data-testid="improved-essay"]')

      // Verify improved version is displayed
      await expect(page.locator('[data-testid="improved-essay"]')).toBeVisible()
      await expect(page.locator('[data-testid="improved-essay"]')).toContainText('Among the four seasons')

      // Check comparison mode
      await helpers.clickAndWait('[data-testid="compare-versions"]', '[data-testid="comparison-view"]')

      // Verify side-by-side comparison
      await expect(page.locator('[data-testid="original-text"]')).toBeVisible()
      await expect(page.locator('[data-testid="improved-text"]')).toBeVisible()

      // Check highlighted changes
      await expect(page.locator('[data-testid="text-changes"]')).toBeVisible()
    })

    // Step 8: Add teacher comments
    await test.step('添加教师评语', async () => {
      await helpers.clickAndWait('[data-testid="add-teacher-comments"]', '[data-testid="teacher-comments-section"]')

      // Add overall comment
      await helpers.fillField('[data-testid="overall-comment"]', '这是一篇结构清晰的描述文。你很好地描述了秋天的特点，并且用具体的例子支持了你的观点。继续努力提高词汇的多样性。')

      // Add specific feedback on different aspects
      await helpers.fillField('[data-testid="content-feedback"]', '内容丰富，个人经历描述生动')
      await helpers.fillField('[data-testid="language-feedback"]', '语言基本准确，建议增加复合句的使用')

      // Set final grade
      await helpers.fillField('[data-testid="final-grade"]', 'B+')

      // Save teacher feedback
      await helpers.clickAndWait('[data-testid="save-teacher-feedback"]')
      await helpers.verifyToast('教师评语已保存')
    })

    // Step 9: Generate assessment report
    await test.step('生成评改报告', async () => {
      await helpers.clickAndWait('[data-testid="generate-report"]', '[data-testid="report-preview"]')

      // Verify report preview contains all sections
      await expect(page.locator('[data-testid="report-student-info"]')).toContainText('张小明')
      await expect(page.locator('[data-testid="report-scores"]')).toContainText('82')
      await expect(page.locator('[data-testid="report-original-essay"]')).toBeVisible()
      await expect(page.locator('[data-testid="report-feedback"]')).toBeVisible()
      await expect(page.locator('[data-testid="report-improved-version"]')).toBeVisible()
      await expect(page.locator('[data-testid="report-teacher-comments"]')).toContainText('这是一篇结构清晰的描述文')
    })

    // Step 10: Export assessment as DOCX
    await test.step('导出评改报告为DOCX', async () => {
      // Mock export API
      await helpers.mockAPIResponse(
        /\/api\/export\/writing-assessment/,
        {
          download_url: '/api/download/writing-assessment-zhang-xiaoming.docx',
          file_name: 'writing-assessment-zhang-xiaoming.docx'
        }
      )

      // Select DOCX format
      await page.selectOption('[data-testid="export-format"]', 'docx')

      // Configure export options
      await page.check('[data-testid="include-original-essay"]')
      await page.check('[data-testid="include-improved-version"]')
      await page.check('[data-testid="include-rubric-breakdown"]')
      await page.check('[data-testid="include-teacher-comments"]')

      // Export the document
      await helpers.clickAndWait('[data-testid="export-assessment"]')

      // Verify export success
      await helpers.verifyToast('评改报告导出成功')

      // Verify download link or file download
      await expect(page.locator('[data-testid="download-link"]')).toBeVisible()
    })

    // Step 11: Save to student portfolio
    await test.step('保存到学生档案', async () => {
      // Mock save to portfolio API
      await helpers.mockAPIResponse(
        /\/api\/students\/portfolio/,
        {
          message: 'Assessment saved to portfolio',
          portfolio_id: 'portfolio-123'
        }
      )

      await helpers.clickAndWait('[data-testid="save-to-portfolio"]', '[data-testid="portfolio-save-dialog"]')

      // Select portfolio options
      await page.check('[data-testid="track-progress"]')
      await page.check('[data-testid="notify-student"]')

      await helpers.clickAndWait('[data-testid="confirm-save-portfolio"]')
      await helpers.verifyToast('已保存到学生档案')
    })

    // Step 12: Batch assessment setup
    await test.step('设置批量评改', async () => {
      await helpers.clickAndWait('[data-testid="batch-assessment"]', '[data-testid="batch-upload"]')

      // This would normally involve file upload, but we'll mock it
      await helpers.mockAPIResponse(
        /\/api\/writing\/batch-upload/,
        {
          uploaded_files: 5,
          processing_queue: ['essay1.txt', 'essay2.txt', 'essay3.txt']
        }
      )

      // Simulate file selection (in real test, would use actual files)
      await helpers.clickAndWait('[data-testid="select-files"]')

      // Verify batch upload interface
      await expect(page.locator('[data-testid="batch-progress"]')).toBeVisible()
      await expect(page.locator('[data-testid="processing-queue"]')).toContainText('3 个文件等待处理')
    })
  })

  test('测试不同类型写作评改', async ({ page }) => {
    await test.step('测试议论文评改', async () => {
      await helpers.navigateToPage('/writing', '[data-testid="writing-page"]')

      await page.selectOption('[data-testid="writing-type"]', 'argumentative')

      // Configure argumentative essay rubric
      await helpers.clickAndWait('[data-testid="configure-rubric"]', '[data-testid="rubric-config"]')

      // Argumentative essays have different criteria
      await page.check('[data-testid="argument-clarity"]')
      await page.check('[data-testid="evidence-support"]')
      await page.check('[data-testid="counterargument"]')

      await helpers.clickAndWait('[data-testid="save-rubric-config"]')

      const argumentativeEssay = `
        The use of smartphones in schools has become a controversial topic. While some people believe that smartphones should be banned in schools, I strongly disagree with this view.

        First, smartphones can be valuable educational tools. Students can use them to access educational apps, research information quickly, and even take notes more efficiently than with traditional methods.

        However, critics argue that smartphones are distracting and can lead to decreased academic performance. While this concern is valid, proper guidelines and education about responsible use can address these issues.

        In conclusion, instead of banning smartphones completely, schools should focus on teaching students how to use them responsibly as learning tools.
      `

      await helpers.fillField('[data-testid="essay-input"]', argumentativeEssay)

      await helpers.mockAPIResponse(
        /\/api\/ai\/assess-writing/,
        {
          ...mockAIResponses.writingFeedback,
          argumentStructure: {
            hasThesis: true,
            argumentCount: 2,
            counterargumentPresent: true,
            conclusionStrength: 'moderate'
          }
        }
      )

      await helpers.clickAndWait('[data-testid="start-assessment"]', '[data-testid="assessment-results"]')

      // Verify argumentative-specific feedback
      await expect(page.locator('[data-testid="argument-analysis"]')).toBeVisible()
      await expect(page.locator('[data-testid="thesis-strength"]')).toBeVisible()
    })

    await test.step('测试创意写作评改', async () => {
      await page.selectOption('[data-testid="writing-type"]', 'creative')

      // Creative writing has different evaluation criteria
      await helpers.clickAndWait('[data-testid="configure-rubric"]', '[data-testid="rubric-config"]')

      await page.check('[data-testid="creativity-originality"]')
      await page.check('[data-testid="narrative-flow"]')
      await page.check('[data-testid="character-development"]')

      await helpers.clickAndWait('[data-testid="save-rubric-config"]')

      const creativeStory = `
        The old clock tower struck midnight as Sarah walked through the empty streets. She clutched the mysterious letter tightly, wondering who could have left it on her doorstep.

        As she approached the bridge, a figure emerged from the shadows. "You came," the stranger whispered. "I wasn't sure you would believe the letter."

        Sarah's heart pounded. This was definitely not how she had planned to spend her Tuesday night.
      `

      await helpers.fillField('[data-testid="essay-input"]', creativeStory, { clear: true })

      await helpers.mockAPIResponse(
        /\/api\/ai\/assess-writing/,
        {
          ...mockAIResponses.writingFeedback,
          creativityScore: 88,
          narrativeElements: {
            setting: 'well-established',
            characterization: 'basic',
            plotDevelopment: 'engaging'
          }
        }
      )

      await helpers.clickAndWait('[data-testid="start-assessment"]', '[data-testid="assessment-results"]')

      await expect(page.locator('[data-testid="creativity-score"]')).toContainText('88')
      await expect(page.locator('[data-testid="narrative-analysis"]')).toBeVisible()
    })
  })

  test('测试评改历史和进度跟踪', async ({ page }) => {
    await test.step('查看评改历史', async () => {
      await helpers.navigateToPage('/writing', '[data-testid="writing-page"]')

      await helpers.clickAndWait('[data-testid="assessment-history"]', '[data-testid="history-panel"]')

      // Mock assessment history
      await helpers.mockAPIResponse(
        /\/api\/writing\/history/,
        {
          assessments: [
            {
              id: 'assessment-1',
              student: '张小明',
              title: 'My Favorite Season',
              score: 82,
              date: '2024-01-15',
              type: 'descriptive'
            },
            {
              id: 'assessment-2',
              student: '李小红',
              title: 'School Uniforms Debate',
              score: 76,
              date: '2024-01-14',
              type: 'argumentative'
            }
          ]
        }
      )

      await helpers.waitForLoading()

      // Verify history items
      await expect(page.locator('[data-testid="history-item-1"]')).toContainText('张小明')
      await expect(page.locator('[data-testid="history-item-1"]')).toContainText('82')

      // Click to view detailed history
      await helpers.clickAndWait('[data-testid="view-assessment-1"]', '[data-testid="assessment-detail"]')

      await expect(page.locator('[data-testid="assessment-detail"]')).toContainText('My Favorite Season')
    })

    await test.step('查看学生进步情况', async () => {
      await helpers.clickAndWait('[data-testid="student-progress"]', '[data-testid="progress-chart"]')

      // Mock progress data
      await helpers.mockAPIResponse(
        /\/api\/students\/progress/,
        {
          student: '张小明',
          assessments: [
            { date: '2024-01-01', score: 65 },
            { date: '2024-01-08', score: 72 },
            { date: '2024-01-15', score: 82 }
          ],
          improvements: ['词汇使用', '文章结构'],
          needsWork: ['语法准确性']
        }
      )

      await helpers.waitForLoading()

      // Verify progress visualization
      await expect(page.locator('[data-testid="progress-chart"]')).toBeVisible()
      await expect(page.locator('[data-testid="score-trend"]')).toBeVisible()
      await expect(page.locator('[data-testid="improvement-areas"]')).toContainText('词汇使用')
    })
  })

  test('验证错误处理和边界情况', async ({ page }) => {
    await test.step('测试空文本处理', async () => {
      await helpers.navigateToPage('/writing', '[data-testid="writing-page"]')

      await helpers.clickAndWait('[data-testid="start-assessment"]')

      // Verify validation error for empty text
      await expect(page.locator('[data-testid="error-empty-text"]')).toContainText('请输入要评改的文章')
    })

    await test.step('测试文本长度限制', async () => {
      const veryLongText = 'This is a very long text. '.repeat(1000) // Create very long text

      await helpers.fillField('[data-testid="essay-input"]', veryLongText)

      // Verify word count warning
      await expect(page.locator('[data-testid="word-count-warning"]')).toBeVisible()

      await helpers.clickAndWait('[data-testid="start-assessment"]')

      // Should show warning about text length
      await expect(page.locator('[data-testid="text-length-warning"]')).toBeVisible()
    })

    await test.step('测试AI服务错误', async () => {
      await helpers.fillField('[data-testid="essay-input"]', 'Short essay for testing.', { clear: true })

      // Mock AI service error
      await helpers.mockAPIResponse(
        /\/api\/ai\/assess-writing/,
        { error: 'AI service temporarily unavailable' },
        503
      )

      await helpers.clickAndWait('[data-testid="start-assessment"]')

      await helpers.verifyToast('评改服务暂时不可用，请稍后重试', 'error')

      // Verify retry option is available
      await expect(page.locator('[data-testid="retry-assessment"]')).toBeVisible()
    })

    await test.step('测试导出失败处理', async () => {
      // First complete a successful assessment
      await helpers.mockAPIResponse(/\/api\/ai\/assess-writing/, mockAIResponses.writingFeedback)
      await helpers.clickAndWait('[data-testid="start-assessment"]', '[data-testid="assessment-results"]')

      // Then mock export failure
      await helpers.mockAPIResponse(
        /\/api\/export\/writing-assessment/,
        { error: 'Export service error' },
        500
      )

      await helpers.clickAndWait('[data-testid="export-assessment"]')

      await helpers.verifyToast('导出失败，请稍后重试', 'error')
    })
  })
})