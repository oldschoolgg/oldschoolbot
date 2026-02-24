import { defineConfig } from 'vitest/config';

import { ECONOMY_SERIAL_TESTS, integrationBase, resolveConfig } from './vitest.integration.config.mts';

export default defineConfig({
	clearScreen: false,
	test: {
		name: 'Old School Bot - Integration (Economy Serial)',
		include: [...ECONOMY_SERIAL_TESTS],
		...integrationBase,
		maxConcurrency: 1,
		maxWorkers: 1,
		fileParallelism: false,
		sequence: {
			shuffle: false,
			seed: 1
		}
	},
	resolve: resolveConfig
});
