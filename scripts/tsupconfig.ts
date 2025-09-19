import { relative, resolve as resolveDir } from 'node:path';
import { type Options, defineConfig } from 'tsdown';

const tsconfigPath = relative(__dirname, resolveDir(process.cwd(), 'src', 'tsconfig.json'));

const baseOptions: Options = {
	clean: true,
	dts: true,
	minify: false,
	skipNodeModulesBundle: true,
	sourcemap: true,
	target: 'node20',
	tsconfig: tsconfigPath,
	platform: 'node',
	hash: false,
	unbundle: true,
	report: false,
	logLevel: 'error'
};

export function createTsupConfig(options: Options = {}) {
	return [
		defineConfig({
			...baseOptions,
			outDir: 'dist/cjs',
			format: 'cjs',
			outExtensions: () => ({ js: '.cjs', json: '.json' }),
			...options
		}),
		defineConfig({
			...baseOptions,
			outDir: 'dist/esm',
			format: 'esm',
			outExtensions: () => ({ js: '.mjs', json: '.json' }),
			...options
		})
	];
}
