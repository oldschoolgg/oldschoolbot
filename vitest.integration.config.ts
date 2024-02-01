import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'Old School Bot - Integration',
		include: ['tests/integration/**/*.test.ts'],
		setupFiles: 'tests/integration/setup.ts',
		coverage: {
			provider: 'c8',
			reporter: 'text',
			include: ['src/lib/MUser.ts']
		},
		testTimeout: 30_000,
		bail: 1,
		minThreads: 3,
		maxThreads: 3
	}
});
