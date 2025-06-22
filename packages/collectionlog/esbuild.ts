import * as esbuild from 'esbuild';

const baseOptions: esbuild.BuildOptions = {
	keepNames: true,
	minify: false,
	external: ['oldschooljs'],
	entryPoints: ['./src/index.ts'],
	bundle: true,
	sourcemap: true,
	metafile: true,
	platform: 'node'
};

async function main() {
	await Promise.all([
		esbuild.build({
			...baseOptions,
			format: 'cjs',
			target: 'node20',
			outdir: './dist/cjs',
			outExtension: { '.js': '.cjs' }
		}),
		esbuild.build({
			...baseOptions,
			format: 'esm',
			target: 'esnext',
			outdir: './dist/esm',
			outExtension: { '.js': '.mjs' }
		})
	]);
}

main();
