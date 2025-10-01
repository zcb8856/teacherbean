import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Get Started')
    await expect(page).toHaveURL('/auth/login')
    await expect(page.locator('h1')).toContainText('Sign in to TeacherBean')
  })

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/auth/login')
    await page.click('text=Sign up')
    await expect(page).toHaveURL('/auth/signup')
    await expect(page.locator('h1')).toContainText('Create your account')
  })

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.goto('/auth/login')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('should redirect to login when accessing protected routes', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/auth/login')
  })

  test('should display homepage correctly', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('TeacherBean')
    await expect(page.locator('text=AI-powered English teaching platform')).toBeVisible()

    // Check feature cards
    await expect(page.locator('text=Lesson Planning')).toBeVisible()
    await expect(page.locator('text=Reading Materials')).toBeVisible()
    await expect(page.locator('text=Interactive Dialogs')).toBeVisible()
    await expect(page.locator('text=Quick Games')).toBeVisible()
    await expect(page.locator('text=Writing Assistant')).toBeVisible()
    await expect(page.locator('text=Assessment Hub')).toBeVisible()
  })
})