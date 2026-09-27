import { defineConfig, type UserConfig } from 'tsdown';

const baseOptions: UserConfig = {
	clean: true,
	dts: true,
	entry: ['src/index.ts', 'src/crypto.ts'],
	minify: false,
	skipNodeModulesBundle: true,
	sourcemap: true,
	tsconfig: './src/tsconfig.json',
	treeshake: true
};

export default [
	defineConfig({
		...baseOptions,
		outDir: 'dist/cjs',
		format: 'cjs',
		target: 'es2020'
	}),
	defineConfig({
		...baseOptions,
		outDir: 'dist/esm',
		target: 'node2024',
		format: 'esm'
	})
];
