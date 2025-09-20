import { relative, resolve as resolveDir } from 'node:path';
import { type Options, defineConfig } from 'tsdown';

const tsconfigPath = relative(import.meta.dirname, resolveDir(process.cwd(), 'src', 'tsconfig.json'));

const baseOptions: Options = {
	clean: true,
	dts: true,
	minify: true,
	skipNodeModulesBundle: true,
	sourcemap: 'inline',
	target: 'node24',
	tsconfig: tsconfigPath,
	platform: 'node',
	hash: false,
	unbundle: true,
	report: false,
	logLevel: 'error'
};

export function createTsdownConfig(options: Options = {}) {
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
