import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'OldschoolJS',
		benchmark: {
			include: ['test/**/*.bench.ts']
		},
		include: ['test/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			include: ['src'],
			reporter: ['text'],
			exclude: [
				'src/simulation/monsters/**/*.ts',
				'src/simulation/misc/**/*.ts',
				'src/simulation/subtables/**/*.ts',
				'src/simulation/clues/**/*.ts',
				'src/simulation/openables/**/*.ts',
				'src/structures/Collection.ts'
			]
		},
		isolate: false,
		pool: 'threads',
		poolOptions: {
			threads: {
				minThreads: 5,
				maxThreads: 5,
				execArgv: ['--disable-warning=ExperimentalWarning']
			}
		}
	}
});
