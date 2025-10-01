import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/unit/**/*.test.{js,ts}',
      'tests/integration/**/*.test.{js,ts}',
      'app/**/*.test.{js,ts}',
      'lib/**/*.test.{js,ts}'
    ],
    exclude: [
      'node_modules',
      'tests/e2e/**/*',
      'tests/fixtures/**/*',
      'tests/utils/**/*'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'app/api/**/*',
        'lib/**/*',
        'utils/**/*'
      ],
      exclude: [
        'node_modules',
        'tests/**/*',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}',
        '**/types.ts',
        '**/index.ts'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@/app': resolve(__dirname, 'app'),
      '@/lib': resolve(__dirname, 'lib'),
      '@/types': resolve(__dirname, 'types'),
      '@/utils': resolve(__dirname, 'utils'),
      '@/data': resolve(__dirname, 'data')
    }
  }
})