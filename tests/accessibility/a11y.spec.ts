import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { ensureAuthenticated, testUsers } from '../fixtures/auth'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page, testUsers.teacher1)
  })

  test('dashboard page should be accessible', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('lesson planner should be accessible', async ({ page }) => {
    await page.goto('/planner')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('classroom page should be accessible', async ({ page }) => {
    await page.goto('/classroom')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('writing assessment should be accessible', async ({ page }) => {
    await page.goto('/writing')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('library page should be accessible', async ({ page }) => {
    await page.goto('/library')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('assess page should be accessible', async ({ page }) => {
    await page.goto('/assess')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('keyboard navigation should work', async ({ page }) => {
    await page.goto('/dashboard')

    // Test tab navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()

    // Navigate through main menu items
    const menuItems = page.locator('[role="menuitem"], [role="button"]')
    const count = await menuItems.count()

    for (let i = 0; i < Math.min(count, 10); i++) {
      await page.keyboard.press('Tab')
      const focused = page.locator(':focus')
      await expect(focused).toBeVisible()
    }
  })

  test('screen reader landmarks should be present', async ({ page }) => {
    await page.goto('/dashboard')

    // Check for essential landmarks
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('[role="banner"], header')).toBeVisible()

    // Check for proper heading structure
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
    await expect(h1).toBeVisible()
  })

  test('forms should have proper labels', async ({ page }) => {
    await page.goto('/planner')

    const inputs = page.locator('input, textarea, select')
    const inputCount = await inputs.count()

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledBy = await input.getAttribute('aria-labelledby')

      // Each input should have either a label, aria-label, or aria-labelledby
      const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false

      expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy()
    }
  })

  test('color contrast should meet WCAG standards', async ({ page }) => {
    await page.goto('/dashboard')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('[role="button"], [role="link"], p, h1, h2, h3, h4, h5, h6')
      .analyze()

    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    )

    expect(colorContrastViolations).toEqual([])
  })

  test('focus indicators should be visible', async ({ page }) => {
    await page.goto('/dashboard')

    // Test that focused elements have visible focus indicators
    const focusableElements = page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const count = await focusableElements.count()

    for (let i = 0; i < Math.min(count, 5); i++) {
      const element = focusableElements.nth(i)
      await element.focus()

      // Check that the focused element has some kind of focus indicator
      const outline = await element.evaluate(el => getComputedStyle(el).outline)
      const boxShadow = await element.evaluate(el => getComputedStyle(el).boxShadow)
      const border = await element.evaluate(el => getComputedStyle(el).border)

      const hasFocusIndicator = outline !== 'none' ||
                               boxShadow !== 'none' ||
                               border.includes('rgb') // Colored border

      expect(hasFocusIndicator).toBeTruthy()
    }
  })

  test('images should have alt text', async ({ page }) => {
    await page.goto('/dashboard')

    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const ariaLabel = await img.getAttribute('aria-label')
      const role = await img.getAttribute('role')

      // Decorative images should have empty alt or role="presentation"
      // Content images should have descriptive alt text
      const isDecorative = alt === '' || role === 'presentation'
      const hasAltText = alt && alt.length > 0
      const hasAriaLabel = ariaLabel && ariaLabel.length > 0

      expect(isDecorative || hasAltText || hasAriaLabel).toBeTruthy()
    }
  })
})