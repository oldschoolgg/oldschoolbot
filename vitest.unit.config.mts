import { basename, dirname, join } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'Old School Bot - Unit',
		include: ['tests/unit/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: 'html',
			include: ['src/lib/structures/Gear.ts', 'src/lib/util/parseStringBank.ts', 'src/lib/util/equipMulti.ts']
		},
		setupFiles: 'tests/unit/setup.ts',
		resolveSnapshotPath: (testPath, extension) =>
			join(join(dirname(testPath), 'snapshots'), `${basename(testPath)}${extension}`),
		slowTestThreshold: 0,
		isolate: false,
		poolOptions: {
			threads: {
				minThreads: 10,
				maxThreads: 20,
				singleThread: true
			}
		}
	}
});
