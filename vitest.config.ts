import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'Old School Bot',
		include: ['tests/**/*.test.ts'],
		coverage: {
			provider: 'c8',
			reporter: 'text-summary'
		},
		setupFiles: 'tests/setup.ts'
	}
});
