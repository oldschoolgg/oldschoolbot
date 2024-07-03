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
		pool: 'threads',
		poolOptions: {
			forks: {
				maxForks: 30,
				minForks: 20
			},
			threads: {
				maxThreads: 30,
				minThreads: 20
			}
		}
	}
});
