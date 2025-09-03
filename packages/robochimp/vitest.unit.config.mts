import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'RoboChimp - Unit',
		include: ['tests/unit/**/*.test.ts'],
		setupFiles: 'tests/unit/setup.ts',
		slowTestThreshold: 0,
		isolate: false,
		pool: 'forks',
		poolOptions: {
			forks: {
				maxForks: 5,
				minForks: 5,
				execArgv: ['--disable-warning=ExperimentalWarning']
			}
		}
	}
});
