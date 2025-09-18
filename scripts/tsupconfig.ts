import { relative, resolve as resolveDir } from 'node:path';
import { defineConfig, type Options } from 'tsdown';


const tsconfigPath = relative(__dirname, resolveDir(process.cwd(), 'src', 'tsconfig.json'));

const baseOptions: Options = {
	clean: true,
	dts: true,
	minify: false,
	skipNodeModulesBundle: true,
	sourcemap: true,
	target: 'es2022',
	tsconfig: tsconfigPath,
	treeshake: true
};

export function createTsupConfig(options: EnhancedTsupOptions = {}) {
	return [
		defineConfig({
			...baseOptions,
			entry: options.entryPoints ?? baseOptions.entry,
			outDir: 'dist/cjs',
			format: 'cjs',
			outExtensions: () => ({ js: '.cjs' }),
			...options.cjsOptions
		}),
		defineConfig({
			...baseOptions,
			entry: options.entryPoints ?? baseOptions.entry,
			outDir: 'dist/esm',
			format: 'esm',
			outExtensions: () => ({ js: '.mjs' }),
			...options.esmOptions
		}),
	];
}

interface EnhancedTsupOptions {
	entryPoints?: string[];
	cjsOptions?: Options;
	esmOptions?: Options;
}
