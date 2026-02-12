import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['tests/*.test.ts'],
		isolate: false,
		pool: 'threads',
		maxWorkers: 4
	}
});
