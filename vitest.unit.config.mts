import path, { basename, dirname, join } from 'node:path';
import { defineConfig } from 'vitest/config';

import { STATIC_DEFINE } from './meta';

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
		},
		coverage: {
			provider: 'v8',
			include: ['src/lib/util/parseStringBank.ts', 'src/lib/structures/Gear.ts'],
			reporter: ['text']
		}
	},
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src')
		}
	},
	define: STATIC_DEFINE
});
