import { Page, expect } from '@playwright/test'

export class TestHelpers {
  constructor(private page: Page) {}

  // Wait for element to be visible and stable
  async waitForElement(selector: string, timeout = 30000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout })
    await this.page.waitForTimeout(500) // Wait for any animations
  }

  // Wait for loading to complete
  async waitForLoading() {
    // Wait for any loading spinners to disappear
    await this.page.waitForSelector('[data-testid="loading"]', { state: 'hidden', timeout: 30000 })
    await this.page.waitForLoadState('networkidle')
  }

  // Fill form field with validation
  async fillField(selector: string, value: string, options?: { clear?: boolean }) {
    if (options?.clear) {
      await this.page.fill(selector, '')
    }
    await this.page.fill(selector, value)

    // Verify the value was set correctly
    const inputValue = await this.page.inputValue(selector)
    expect(inputValue).toBe(value)
  }

  // Click button and wait for action to complete
  async clickAndWait(selector: string, waitFor?: string) {
    await this.page.click(selector)

    if (waitFor) {
      await this.waitForElement(waitFor)
    } else {
      await this.page.waitForTimeout(1000)
    }
  }

  // Select dropdown option
  async selectOption(selector: string, value: string) {
    await this.page.selectOption(selector, value)

    // Verify selection
    const selectedValue = await this.page.inputValue(selector)
    expect(selectedValue).toBe(value)
  }

  // Handle modals and dialogs
  async handleModal(action: () => Promise<void>, expectModal = true) {
    if (expectModal) {
      const modalPromise = this.page.waitForSelector('[role="dialog"]', { state: 'visible' })
      await action()
      await modalPromise
    } else {
      await action()
    }
  }

  // Upload file
  async uploadFile(inputSelector: string, filePath: string) {
    await this.page.setInputFiles(inputSelector, filePath)
  }

  // Download file and verify
  async downloadFile(triggerSelector: string): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download')
    await this.page.click(triggerSelector)
    const download = await downloadPromise

    // Save to temp location
    const path = `./test-results/downloads/${download.suggestedFilename()}`
    await download.saveAs(path)

    return path
  }

  // Verify toast message
  async verifyToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    const toastSelector = `[data-testid="toast-${type}"]`
    await this.waitForElement(toastSelector)

    const toastText = await this.page.textContent(toastSelector)
    expect(toastText).toContain(message)
  }

  // Navigate and verify page
  async navigateToPage(path: string, expectedElement?: string) {
    await this.page.goto(path)

    if (expectedElement) {
      await this.waitForElement(expectedElement)
    }

    // Verify URL
    expect(this.page.url()).toContain(path)
  }

  // Wait for API response
  async waitForAPIResponse(urlPattern: string | RegExp, timeout = 30000) {
    return await this.page.waitForResponse(
      response => {
        const url = response.url()
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern)
        }
        return urlPattern.test(url)
      },
      { timeout }
    )
  }

  // Mock API response
  async mockAPIResponse(urlPattern: string | RegExp, response: any, status = 200) {
    await this.page.route(urlPattern, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response)
      })
    })
  }

  // Take screenshot with custom name
  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `./test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true
    })
  }

  // Scroll to element
  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded()
  }

  // Wait for table to load
  async waitForTable(tableSelector: string, minRows = 1) {
    await this.waitForElement(tableSelector)

    // Wait for at least minRows of data
    await this.page.waitForFunction(
      ({ selector, rows }) => {
        const table = document.querySelector(selector)
        const dataRows = table?.querySelectorAll('tbody tr:not([data-empty])')
        return dataRows && dataRows.length >= rows
      },
      { selector: tableSelector, rows: minRows },
      { timeout: 30000 }
    )
  }

  // Verify card content
  async verifyCardContent(cardSelector: string, expectedContent: Record<string, string>) {
    await this.waitForElement(cardSelector)

    for (const [key, value] of Object.entries(expectedContent)) {
      const element = this.page.locator(`${cardSelector} [data-testid="${key}"]`)
      await expect(element).toContainText(value)
    }
  }

  // Clear all inputs in a form
  async clearForm(formSelector: string) {
    const inputs = this.page.locator(`${formSelector} input, ${formSelector} textarea`)
    const count = await inputs.count()

    for (let i = 0; i < count; i++) {
      await inputs.nth(i).clear()
    }
  }
}