import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Root config is only for the shared test suite; each game runs its own Vite dev server.
export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
