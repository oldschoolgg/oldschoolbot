import path, { basename, dirname, join } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'Old School Bot - Unit',
		include: ['tests/unit/**/*.test.ts'],
		setupFiles: 'tests/unit/setup.ts',
		resolveSnapshotPath: (testPath, extension) =>
			join(join(dirname(testPath), 'snapshots'), `${basename(testPath)}${extension}`),
		isolate: false,
		pool: 'threads',
		poolOptions: {
			threads: {
				singleThread: true
			}
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/lib/skilling/skills/**/*.{ts,tsx}'],
			skipFull: true
		}
	},
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src')
		}
	}
});
