const esbuild = require('esbuild');

esbuild
	.build({
		keepNames: true,
		minify: false,
		external: ['node-fetch'],
		entryPoints: ['./src/index.ts', './src/util/util.ts'],
		bundle: true,
		sourcemap: true,
		format: 'esm',
		target: 'esnext',
		outdir: './dist',
		platform: 'node',
		outExtension: { '.js': '.mjs' }
	})
	.catch(() => process.exit(1));
