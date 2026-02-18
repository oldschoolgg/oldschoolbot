import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	clearScreen: false,
	test: {
		// These tests touch shared/global economy state and must run serially.
		name: 'Old School Bot - Integration (Economy Serial)',
		include: [
			'tests/integration/grandExchange.test.ts',
			'tests/integration/migrateUser.test.ts',
			'tests/integration/paymentConflict.test.ts',
			'tests/integration/trading.test.ts',
			'tests/integration/tradeTransaction.test.ts',
			'tests/integration/commands/sacrifice.test.ts',
			'tests/integration/commands/dice.test.ts'
		],
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
