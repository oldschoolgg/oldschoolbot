import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'Old School Bot - Integration',
		include: ['tests/integration/**/*.test.ts'],
		setupFiles: 'tests/integration/setup.ts',
		coverage: {
			provider: 'v8',
			reporter: 'text'
		},
		testTimeout: 30_000,
		bail: 1,
		pool: 'forks',
		maxConcurrency: 5,
		poolOptions: {
			forks: {
				maxForks: 10,
				minForks: 10
			}
		}
	}
});
