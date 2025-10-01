import { test, expect } from '@playwright/test'
import { ensureAuthenticated, testUsers } from '../fixtures/auth'
import { TestHelpers } from '../utils/test-helpers'
import { lessonPlanData, mockAIResponses } from '../fixtures/test-data'

test.describe('Lesson Planner E2E Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await ensureAuthenticated(page, testUsers.teacher1)
  })

  test('教师登录后在 /planner 生成七年级"Food & Health"教案并保存为模板', async ({ page }) => {
    // Step 1: Navigate to lesson planner
    await test.step('导航到教案规划页面', async () => {
      await helpers.navigateToPage('/planner', '[data-testid="lesson-planner"]')
      await expect(page.locator('h1')).toContainText('教案规划')
    })

    // Step 2: Fill in basic lesson information
    await test.step('填写基本课程信息', async () => {
      // Select grade level
      await helpers.fillField('[data-testid="grade-input"]', lessonPlanData.grade)

      // Enter subject/topic
      await helpers.fillField('[data-testid="subject-input"]', lessonPlanData.subject)

      // Set lesson duration
      await helpers.fillField('[data-testid="duration-input"]', lessonPlanData.duration.toString())

      // Add learning objectives
      for (let i = 0; i < lessonPlanData.objectives.length; i++) {
        await helpers.fillField(`[data-testid="objective-${i}"]`, lessonPlanData.objectives[i])

        // Add more objective fields if needed
        if (i < lessonPlanData.objectives.length - 1) {
          await helpers.clickAndWait('[data-testid="add-objective"]')
        }
      }

      // Add vocabulary
      const vocabularyText = lessonPlanData.vocabulary.join(', ')
      await helpers.fillField('[data-testid="vocabulary-input"]', vocabularyText)
    })

    // Step 3: Configure lesson activities
    await test.step('配置课程活动', async () => {
      for (let i = 0; i < lessonPlanData.activities.length; i++) {
        const activity = lessonPlanData.activities[i]

        // Add activity if not the first one
        if (i > 0) {
          await helpers.clickAndWait('[data-testid="add-activity"]')
        }

        // Fill activity details
        await helpers.fillField(`[data-testid="activity-name-${i}"]`, activity.name)
        await helpers.fillField(`[data-testid="activity-duration-${i}"]`, activity.duration.toString())
        await helpers.fillField(`[data-testid="activity-description-${i}"]`, activity.description)
      }
    })

    // Step 4: Mock AI response for lesson plan generation
    await test.step('模拟AI生成教案', async () => {
      // Mock the AI API response
      await helpers.mockAPIResponse(
        /\/api\/ai\/generate-lesson-plan/,
        mockAIResponses.lessonPlan
      )
    })

    // Step 5: Generate lesson plan
    await test.step('生成教案', async () => {
      await helpers.clickAndWait('[data-testid="generate-lesson-plan"]', '[data-testid="lesson-plan-preview"]')

      // Wait for generation to complete
      await helpers.waitForLoading()

      // Verify generated content appears
      await expect(page.locator('[data-testid="lesson-plan-preview"]')).toBeVisible()
      await expect(page.locator('[data-testid="lesson-title"]')).toContainText('Food & Health')
      await expect(page.locator('[data-testid="lesson-grade"]')).toContainText('七年级')
    })

    // Step 6: Review and edit generated lesson plan
    await test.step('审查和编辑生成的教案', async () => {
      // Check objectives are displayed
      for (const objective of lessonPlanData.objectives) {
        await expect(page.locator('[data-testid="objectives-list"]')).toContainText(objective)
      }

      // Check activities are displayed
      for (const activity of lessonPlanData.activities) {
        await expect(page.locator('[data-testid="activities-list"]')).toContainText(activity.name)
      }

      // Make a small edit to demonstrate editing capability
      await helpers.clickAndWait('[data-testid="edit-lesson-plan"]')
      await helpers.fillField('[data-testid="lesson-notes"]', '注意观察学生对健康饮食概念的理解程度')
    })

    // Step 7: Save as template
    await test.step('保存为模板', async () => {
      // Open save dialog
      await helpers.clickAndWait('[data-testid="save-as-template"]', '[data-testid="save-template-dialog"]')

      // Fill template information
      await helpers.fillField('[data-testid="template-title"]', 'Food & Health 教案模板')
      await helpers.fillField('[data-testid="template-description"]', '适用于七年级的健康饮食主题教案模板')

      // Select sharing level
      await page.selectOption('[data-testid="template-sharing"]', 'school')

      // Add tags
      await helpers.fillField('[data-testid="template-tags"]', '健康, 饮食, 七年级, 词汇')

      // Set CEFR level
      await page.selectOption('[data-testid="template-cefr"]', 'A2')

      // Mock save API
      await helpers.mockAPIResponse(
        /\/api\/materials/,
        {
          message: 'Template saved successfully',
          data: {
            id: 'template-123',
            title: 'Food & Health 教案模板',
            type: 'lesson_plan'
          }
        }
      )

      // Save template
      await helpers.clickAndWait('[data-testid="confirm-save-template"]')

      // Verify success message
      await helpers.verifyToast('模板保存成功')
    })

    // Step 8: Verify template appears in library
    await test.step('验证模板出现在资源库中', async () => {
      // Navigate to library
      await helpers.navigateToPage('/library', '[data-testid="library-page"]')

      // Switch to "我的资源" tab
      await helpers.clickAndWait('[data-testid="my-resources-tab"]')

      // Look for our saved template
      await helpers.waitForTable('[data-testid="materials-table"]')
      await expect(page.locator('[data-testid="materials-table"]')).toContainText('Food & Health 教案模板')

      // Verify template details
      const templateCard = page.locator('[data-testid="material-card"]').filter({ hasText: 'Food & Health 教案模板' })
      await expect(templateCard).toBeVisible()
      await expect(templateCard.locator('[data-testid="material-type"]')).toContainText('教案设计')
      await expect(templateCard.locator('[data-testid="material-sharing"]')).toContainText('学校共享')
    })

    // Step 9: Test template reuse
    await test.step('测试模板复用', async () => {
      // Go back to planner
      await helpers.navigateToPage('/planner', '[data-testid="lesson-planner"]')

      // Click "Use Template" button
      await helpers.clickAndWait('[data-testid="use-template"]', '[data-testid="template-selector"]')

      // Select our template
      const templateOption = page.locator('[data-testid="template-option"]').filter({ hasText: 'Food & Health 教案模板' })
      await templateOption.click()

      // Verify template data is loaded
      await expect(page.locator('[data-testid="subject-input"]')).toHaveValue('Food & Health')
      await expect(page.locator('[data-testid="grade-input"]')).toHaveValue('七年级')
    })

    // Step 10: Export lesson plan
    await test.step('导出教案', async () => {
      // Generate a fresh lesson plan for export
      await helpers.clickAndWait('[data-testid="generate-lesson-plan"]', '[data-testid="lesson-plan-preview"]')
      await helpers.waitForLoading()

      // Mock export API
      await helpers.mockAPIResponse(
        /\/api\/export\/lesson-plan/,
        { download_url: '/api/download/lesson-plan-123.docx' }
      )

      // Test different export formats
      const exportFormats = ['docx', 'pdf']

      for (const format of exportFormats) {
        await page.selectOption('[data-testid="export-format"]', format)
        await helpers.clickAndWait('[data-testid="export-lesson-plan"]')

        // Verify export initiated
        await helpers.verifyToast(`教案导出为 ${format.toUpperCase()} 格式成功`)
      }
    })
  })

  test('验证教案生成的错误处理', async ({ page }) => {
    await test.step('测试必填字段验证', async () => {
      await helpers.navigateToPage('/planner', '[data-testid="lesson-planner"]')

      // Try to generate without required fields
      await helpers.clickAndWait('[data-testid="generate-lesson-plan"]')

      // Verify validation errors
      await expect(page.locator('[data-testid="error-grade"]')).toContainText('请选择年级')
      await expect(page.locator('[data-testid="error-subject"]')).toContainText('请输入课程主题')
    })

    await test.step('测试API错误处理', async () => {
      // Fill required fields
      await helpers.fillField('[data-testid="grade-input"]', '七年级')
      await helpers.fillField('[data-testid="subject-input"]', 'Test Subject')

      // Mock API error
      await helpers.mockAPIResponse(
        /\/api\/ai\/generate-lesson-plan/,
        { error: 'AI service temporarily unavailable' },
        500
      )

      await helpers.clickAndWait('[data-testid="generate-lesson-plan"]')

      // Verify error handling
      await helpers.verifyToast('教案生成失败，请稍后重试', 'error')
    })
  })

  test('验证模板权限和分享功能', async ({ page }) => {
    await test.step('创建私有模板', async () => {
      await helpers.navigateToPage('/planner', '[data-testid="lesson-planner"]')

      // Create a simple lesson plan
      await helpers.fillField('[data-testid="grade-input"]', '八年级')
      await helpers.fillField('[data-testid="subject-input"]', 'Private Lesson')

      await helpers.mockAPIResponse(/\/api\/ai\/generate-lesson-plan/, mockAIResponses.lessonPlan)
      await helpers.clickAndWait('[data-testid="generate-lesson-plan"]', '[data-testid="lesson-plan-preview"]')

      // Save as private template
      await helpers.clickAndWait('[data-testid="save-as-template"]', '[data-testid="save-template-dialog"]')
      await helpers.fillField('[data-testid="template-title"]', 'Private Template')
      await page.selectOption('[data-testid="template-sharing"]', 'private')

      await helpers.mockAPIResponse(/\/api\/materials/, { message: 'Template saved', data: { id: 'private-123' } })
      await helpers.clickAndWait('[data-testid="confirm-save-template"]')
      await helpers.verifyToast('模板保存成功')
    })

    await test.step('验证私有模板不对其他用户可见', async () => {
      // This would require a second user session to fully test
      // For now, we verify the sharing level is correctly set
      await helpers.navigateToPage('/library')
      await helpers.clickAndWait('[data-testid="my-resources-tab"]')

      const privateTemplate = page.locator('[data-testid="material-card"]').filter({ hasText: 'Private Template' })
      await expect(privateTemplate.locator('[data-testid="material-sharing"]')).toContainText('私有')
    })
  })
})