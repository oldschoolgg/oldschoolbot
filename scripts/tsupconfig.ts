import path, { relative, resolve as resolveDir } from 'node:path';
import { defineConfig, type Options } from 'tsdown';

const tsconfigPath = relative(__dirname, resolveDir(process.cwd(), 'src', 'tsconfig.json'));

const baseOptions: Options = {
	clean: true,
	dts: true,
	minify: false,
	skipNodeModulesBundle: true,
	sourcemap: true,
	target: 'node20',
	tsconfig: tsconfigPath,
	treeshake: true,
	platform: 'node',
	hash: false,
	outputOptions: {
		advancedChunks: {
			groups: [
				{
					test: (id: string) => id.endsWith('.json'),
					name: (id, t) => {
						const x = path.basename(id);
						console.log({x, info: t.getModuleInfo(id)});
						return x;
					},
				}
			]
		}
	}
};

export function createTsupConfig(options: EnhancedTsupOptions = {}) {
	return [
		defineConfig({
			...baseOptions,
			entry: options.entryPoints ?? baseOptions.entry,
			outDir: 'dist/cjs',
			format: 'cjs',
			outExtensions: () => ({ js: '.cjs', json: '.json' }),
			...options.cjsOptions
		}),
		defineConfig({
			...baseOptions,
			entry: options.entryPoints ?? baseOptions.entry,
			outDir: 'dist/esm',
			format: 'esm',
			outExtensions: () => ({ js: '.mjs', json: '.json' }),
			...options.esmOptions
		}),
	];
}

interface EnhancedTsupOptions {
	entryPoints?: string[];
	cjsOptions?: Options;
	esmOptions?: Options;
}
