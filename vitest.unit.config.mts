import { basename, dirname, join } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'Old School Bot - Unit',
		include: ['tests/unit/**/*.test.ts'],
		setupFiles: 'tests/unit/setup.ts',
		resolveSnapshotPath: (testPath, extension) =>
			join(join(dirname(testPath), 'snapshots'), `${basename(testPath)}${extension}`),
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
