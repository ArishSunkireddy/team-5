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
      // Floors sit just under the Nov 20 2026 baseline (stmts 80, branches 74, funcs 80, lines 81).
      // Raise them as coverage improves; they exist to stop regressions, not to block anyone today.
      thresholds: {
        statements: 75,
        branches: 70,
        functions: 75,
        lines: 75,
      },
    },
  },
})
