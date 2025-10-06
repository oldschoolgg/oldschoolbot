import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'Old School Bot - Integration',
		include: ['tests/integration/**/*.test.ts'],
		setupFiles: ['tests/integration/setup.ts'],
		globalSetup: 'tests/integration/globalSetup.ts',
		// coverage: {
		// 	provider: 'v8',
		// 	reporter: 'text',
		// 	include: ['src/mahoji/lib/abstracted_commands/minionKill/*.ts', 'src/lib/structures/*.ts']
		// },
		reporters: ['hanging-process'],
		testTimeout: 260_000,
		// pool: 'forks',
		pool: 'forks',
		maxWorkers: 4,
		poolOptions: {
			forks: {
				maxForks: 1
			}
		}
		// poolOptions: {
		// 	threads: {
		// 		singleThread: true,
		// 		maxThreads: 1,
		// 		minThreads: 1,
		// 	}
		// },
		// maxWorkers: 1,
	},
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src')
		}
	}
});
