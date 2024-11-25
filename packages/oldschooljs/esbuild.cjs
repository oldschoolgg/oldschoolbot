const esbuild = require('esbuild');

esbuild
	.build({
		keepNames: true,
		minify: false,
		external: ['node-fetch'],
		entryPoints: ['./src/index.ts', './src/util/util.ts'],
		bundle: true,
		sourcemap: true,
		format: 'cjs',
		target: 'node20',
		outdir: './dist',
		platform: 'node',
		outExtension: { '.js': '.cjs' }
	})
	.catch(() => process.exit(1));
