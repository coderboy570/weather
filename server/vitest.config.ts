import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    clearMocks: true,
    restoreMocks: true,
    // Ensure test-mode behavior (quiet logger, rate limiter disabled) regardless
    // of what .env says.
    env: {
      NODE_ENV: 'test',
    },
  },
});
