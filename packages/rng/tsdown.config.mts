import { relative, resolve as resolveDir } from 'node:path';
import { defineConfig, type Options } from 'tsdown';

const entry = ['./src/index.ts'];

const tsconfigPath = relative(import.meta.dirname, resolveDir(process.cwd(), 'src', 'tsconfig.json'));

const baseOptions: Options = {
	clean: true,
	dts: true,
	minify: false,
	skipNodeModulesBundle: false,
	sourcemap: 'inline',
	target: 'node24',
	tsconfig: tsconfigPath,
	platform: 'node',
	hash: false,
	unbundle: false,
	report: true,
	logLevel: 'error',
	noExternal: ['pure-rand']
};

export default defineConfig({
	...baseOptions,
	outDir: 'dist/esm',
	format: 'esm',
	outExtensions: () => ({ js: '.mjs', json: '.json' }),
	entry
});
