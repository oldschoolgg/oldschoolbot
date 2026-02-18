import path from 'node:path';
import { defineConfig } from 'vitest/config';

const isCI = process.env.CI === '1' || process.env.CI === 'true';
const maxWorkers = Number(process.env.VITEST_INTEGRATION_MAX_WORKERS ?? (isCI ? 10 : 2));
const maxConcurrency = Number(process.env.VITEST_INTEGRATION_MAX_CONCURRENCY ?? (isCI ? 4 : 2));

export default defineConfig({
	clearScreen: false,
	test: {
		name: 'Old School Bot - Integration',
		include: ['tests/integration/**/*.test.ts'],
		exclude: [
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
		maxConcurrency,
		isolate: false,
		pool: 'forks',
		maxWorkers,
		sequence: {
			shuffle: true,
			seed: 1
		}
	},

	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src')
		}
	}
});
