import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'Old School Bot - Integration',
    include: ['tests/integration/**/*.test.ts'],
    setupFiles: 'tests/integration/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: 'text',
      include: ['src/lib/MUser.ts']
    },
    testTimeout: 30_000,
    bail: 1,
		maxConcurrency: 5,
		maxWorkers: 5,
		minWorkers: 1,
		pool: 'forks'
  }
});
