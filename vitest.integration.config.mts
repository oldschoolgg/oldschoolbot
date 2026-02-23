import path from 'node:path';
import { defineConfig } from 'vitest/config';

export const ECONOMY_SERIAL_TESTS = [
	'tests/integration/grandExchange.test.ts',
	'tests/integration/migrateUser.test.ts',
	'tests/integration/paymentConflict.test.ts',
	'tests/integration/trading.test.ts',
	'tests/integration/tradeTransaction.test.ts',
	'tests/integration/commands/sacrifice.test.ts',
	'tests/integration/commands/dice.test.ts'
] as const;

export const integrationBase = {
	setupFiles: 'tests/integration/setup.ts',
	globalSetup: 'tests/integration/globalSetup.ts',
	coverage: {
		provider: 'v8' as const,
		reporter: 'text' as const,
		include: [
			'src/mahoji/lib/abstracted_commands/minionKill/*.ts',
			'src/lib/structures/*.ts',
			'src/lib/skilling/skills/farming/**/*.ts'
		]
	},
	testTimeout: 60_000,
	maxConcurrency: 4,
	isolate: false,
	pool: 'forks' as const,
	maxWorkers: 10,
	sequence: {
		shuffle: true,
		seed: 1
	}
};

export const resolveConfig = {
	alias: {
		'@': path.resolve(import.meta.dirname, './src')
	}
};

export default defineConfig({
	clearScreen: false,
	test: {
		name: 'Old School Bot - Integration',
		include: ['tests/integration/**/*.test.ts'],
		exclude: [...ECONOMY_SERIAL_TESTS],
		...integrationBase
	},
	resolve: resolveConfig
});
