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
		}
	}
});
