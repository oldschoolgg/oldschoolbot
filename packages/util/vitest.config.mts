import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'Oldschoolgg Util',
		include: ['tests/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text']
		}
	}
});
