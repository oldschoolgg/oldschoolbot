import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'Oldschoolgg RNG',
		include: ['tests/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text'],
			include: ['src/**/*.ts'],
			exclude: ['src/index.ts']
		}
	}
});
