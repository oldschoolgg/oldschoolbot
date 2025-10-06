import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'RoboChimp Tests',
		include: ['tests/**/*.test.ts'],
		setupFiles: 'tests/setup.ts'
	},
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src')
		}
	}
});
