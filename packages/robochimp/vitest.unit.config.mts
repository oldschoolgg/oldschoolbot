import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'RoboChimp Tests',
		include: ['tests/**/*.test.ts'],
		setupFiles: 'tests/setup.ts'
	}
});
