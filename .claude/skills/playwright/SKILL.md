---
name: playwright
description: Setup, configure, and run Playwright tests for web applications. Use when the user wants to "setup Playwright", "run Playwright tests", "configure Playwright", "install Playwright", "debug Playwright tests", or "analyze test results". Covers Playwright Test runner with JavaScript/TypeScript projects.
---

# Playwright Skill

## Instructions

### Setup & Configuration

#### Step 1: Initialize Playwright in a new project
```bash
# Install Playwright and its test runner
npm init playwright@latest

# Or with yarn
yarn create playwright

# Or with pnpm
pnpm create playwright
```

This will:
- Install `@playwright/test` package
- Create `playwright.config.ts` (or `.js`)
- Create example tests in `tests/` directory
- Set up `.gitignore` for test artifacts

#### Step 2: Configure playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Running Tests

#### Step 3: Execute Playwright tests
```bash
# Run all tests
npx playwright test

# Run tests in specific file
npx playwright test tests/example.spec.ts

# Run tests matching pattern
npx playwright test --grep "login"

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests in headed mode (visible browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Run tests with UI mode
npx playwright test --ui
```

### Analyzing Results

#### Step 4: View test results
```bash
# Open HTML report
npx playwright show-report

# View trace file
npx playwright show-trace test-results/*/trace.zip
```

#### Step 5: Debug failing tests
```bash
# Run with debug mode
npx playwright test --debug

# Run with UI mode for interactive debugging
npx playwright test --ui

# Generate trace for analysis
npx playwright test --trace on
```

### Common Test Patterns

```typescript
import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Playwright/);
});

test('click button', async ({ page }) => {
  await page.goto('/');
  await page.click('button:text("Click me")');
  await expect(page.locator('.result')).toHaveText('Clicked!');
});

test('fill form', async ({ page }) => {
  await page.goto('/form');
  await page.fill('#name', 'John Doe');
  await page.fill('#email', 'john@example.com');
  await page.click('button[type="submit"]');
  await expect(page.locator('.success')).toBeVisible();
});
```

## Examples

### Example 1: Setup Playwright for new project
User: "Setup Playwright untuk project baru ini"
→ Run `npm init playwright@latest`
→ Configure `playwright.config.ts` with appropriate settings
→ Create example test file
→ Verify setup by running tests

### Example 2: Run and analyze tests
User: "Jalankan semua Playwright test dan lihat hasilnya"
→ Run `npx playwright test`
→ Open HTML report with `npx playwright show-report`
→ Analyze any failures and provide summary

### Example 3: Debug failing test
User: "Test login saya gagal, bantu debug"
→ Run test with `--debug` flag
→ Use UI mode for interactive debugging
→ Check trace files for screenshots and network logs
→ Identify and fix the issue

## Troubleshooting

### Error: "playwright.config.ts not found"
**Cause:** Playwright not initialized in the project
**Fix:** Run `npm init playwright@latest` to initialize

### Error: "Browser not found"
**Cause:** Browsers not installed
**Fix:** Run `npx playwright install` to install browsers

### Error: "Timeout exceeded"
**Cause:** Test taking too long
**Fix:** 
1. Increase timeout in config: `timeout: 60000`
2. Check if element exists: `await expect(locator).toBeVisible()`
3. Use auto-waiting: Playwright waits automatically

### Error: "Element not found"
**Cause:** Selector doesn't match any element
**Fix:**
1. Use Playwright Inspector to find correct selector
2. Try different selector strategies (text, role, test-id)
3. Add `data-testid` attributes to your elements

### Tests are flaky
**Cause:** Race conditions or timing issues
**Fix:**
1. Use auto-waiting features
2. Avoid `page.waitForTimeout()` - use `expect` with auto-retry
3. Check for network requests with `page.waitForResponse()`

## Best Practices

1. **Use Page Object Model** - Organize selectors and actions in page classes
2. **Use test fixtures** - Share setup/teardown across tests
3. **Use data-testid** - Stable selectors that don't change with UI
4. **Use auto-waiting** - Let Playwright handle waits automatically
5. **Run tests in CI** - Use `--reporter=github` for CI integration
6. **Use traces** - Enable traces for debugging failures
7. **Test across browsers** - Use projects for cross-browser testing
