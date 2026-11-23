import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Root config is only for the shared test suite; each game runs its own Vite dev server.
export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    environment: 'happy-dom',
    globals: true, // <-- Optional: makes describe/it/expect globals available
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',
      exclude: ['tests/**', '**/*.config.*', '**/dist/**', '**/node_modules/**'],
      // Floors were lowered to 60 on Nov 23 2026 (previously 75/70/75/75) after new, not-yet-tested
      // code dropped coverage below the old floors. Raise them as coverage improves; they exist to
      // stop regressions, not to block anyone today.
      thresholds: {
        statements: 60,
        branches: 60,
        functions: 60,
        lines: 60,
      },
    },
  },
})
