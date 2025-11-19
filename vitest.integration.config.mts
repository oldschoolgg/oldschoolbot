import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	clearScreen: false,
	test: {
		name: 'Old School Bot - Integration',
		include: ['tests/integration/**/*.test.ts'],
		setupFiles: 'tests/integration/setup.ts',
		globalSetup: 'tests/integration/globalSetup.ts',
		coverage: {
			provider: 'v8',
			reporter: 'text',
			include: [
				'src/mahoji/lib/abstracted_commands/minionKill/*.ts',
				'src/lib/structures/*.ts',
				'src/lib/skilling/skills/farming/**/*.ts'
			]
		},
		testTimeout: 60_000,
		maxConcurrency: 5,
		isolate: false,
		pool: 'threads',
		maxWorkers: 10
	},
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src')
		}
	}
});
