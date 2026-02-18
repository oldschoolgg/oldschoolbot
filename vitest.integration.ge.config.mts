import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	clearScreen: false,
	test: {
		name: 'Old School Bot - Integration (Grand Exchange)',
		include: ['tests/integration/grandExchange.test.ts'],
		setupFiles: 'tests/integration/setup.ts',
		globalSetup: 'tests/integration/globalSetup.ts',
		testTimeout: 60_000,
		maxConcurrency: 1,
		isolate: true,
		pool: 'forks',
		maxWorkers: 1,
		sequence: {
			shuffle: false
		}
	},

	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src')
		}
	}
});
