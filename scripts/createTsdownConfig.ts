import { readFileSync } from 'node:fs';
import { relative, resolve as resolveDir } from 'node:path';
import { defineConfig, type Options } from 'tsdown';

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
	report: false,
	logLevel: 'error',
	treeshake: true
};

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const external = ['oldschooljs', 'lodash', '@discordjs/builders', '@sapphire/shapeshift', 'discord-api-types'];
const dependencies: string[] = Object.keys(packageJson.dependencies)
	.filter(dep => !dep.startsWith('@oldschoolgg/') && !dep.startsWith('oldschooljs'))
	.filter(dep => !external.includes(dep));

export function createTsdownConfig(options: Options = {}) {
	return [
		defineConfig({
			...baseOptions,
			outDir: 'dist/cjs',
			format: 'cjs',
			external,
			noExternal: dependencies,
			outExtensions: () => ({ js: '.cjs', json: '.json' }),
			...options
		}),
		defineConfig({
			...baseOptions,
			external,
			noExternal: dependencies,
			outDir: 'dist/esm',
			format: 'esm',
			outExtensions: () => ({ js: '.mjs', json: '.json' }),
			...options
		})
	];
}
