import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'Oldschoolgg Toolkit',
		include: ['tests/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text']
		}
	}
});
