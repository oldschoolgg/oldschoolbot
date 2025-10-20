import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'Old School Bot - Integration',
		include: ['tests/integration/**/*.test.ts'],
		setupFiles: 'tests/integration/setup.ts',
		globalSetup: 'tests/integration/globalSetup.ts',
		coverage: {
			provider: 'v8',
			reporter: 'text',
			include: ['src/mahoji/lib/abstracted_commands/minionKill/*.ts', 'src/lib/structures/*.ts']
		},
		testTimeout: 60_000,
		maxConcurrency: 5,
		maxWorkers: 5,
		minWorkers: 5
	},
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src')
		}
	}
});
