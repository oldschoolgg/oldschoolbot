const esbuild = require('esbuild');

const entryPoints = ['src/util.ts', 'src/structures.ts'];

const baseConfig = {
	keepNames: true,
	minify: true,
	treeShaking: true,
	bundle: true,
	entryPoints,
	platform: 'node',
	sourcemap: false,
	external: ['discord.js', 'ioredis'],
	loader: {
		'.json': 'copy'
	}
};

esbuild
	.build({
		...baseConfig,
		outdir: 'dist/esm',
		format: 'esm',
		outExtension: { '.js': '.mjs' },
		target: 'node20'
	})
	.catch(() => process.exit(1));

esbuild
	.build({
		...baseConfig,
		outdir: 'dist/cjs',
		format: 'cjs',
		outExtension: { '.js': '.cjs' },
		target: 'esnext'
	})
	.catch(() => process.exit(1));
