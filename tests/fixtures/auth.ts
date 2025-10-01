import { Page } from '@playwright/test'

export interface TestUser {
  email: string
  password: string
  fullName: string
  schoolName: string
  role: 'teacher' | 'admin'
}

export const testUsers: Record<string, TestUser> = {
  teacher1: {
    email: 'teacher1@weteacher.test',
    password: 'password123',
    fullName: '张老师',
    schoolName: '实验中学',
    role: 'teacher'
  },
  teacher2: {
    email: 'teacher2@weteacher.test',
    password: 'password123',
    fullName: '李老师',
    schoolName: '实验中学',
    role: 'teacher'
  },
  admin: {
    email: 'admin@weteacher.test',
    password: 'admin123',
    fullName: '管理员',
    schoolName: '系统管理',
    role: 'admin'
  }
}

export async function signIn(page: Page, user: TestUser) {
  await page.goto('/auth/signin')

  // Wait for sign-in form to be visible
  await page.waitForSelector('input[type="email"]')

  // Fill in credentials
  await page.fill('input[type="email"]', user.email)
  await page.fill('input[type="password"]', user.password)

  // Submit form
  await page.click('button[type="submit"]')

  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard')

  // Verify user is signed in
  await page.waitForSelector('text=' + user.fullName, { timeout: 10000 })
}

export async function signOut(page: Page) {
  // Click user menu
  await page.click('[data-testid="user-menu"]')

  // Click sign out
  await page.click('text=退出登录')

  // Wait for redirect to sign-in page
  await page.waitForURL('/auth/signin')
}

export async function ensureAuthenticated(page: Page, user: TestUser) {
  try {
    // Try to access dashboard directly
    await page.goto('/dashboard')

    // Check if we're redirected to sign-in
    const url = page.url()
    if (url.includes('/auth/signin')) {
      await signIn(page, user)
    } else {
      // Verify we're actually signed in as the correct user
      await page.waitForSelector('text=' + user.fullName)
    }
  } catch (error) {
    // If anything fails, sign in explicitly
    await signIn(page, user)
  }
}