const esbuild = require('esbuild');

const minifyJsonPlugin = {
	name: 'minify-json',
	setup(build) {
		build.onLoad({ filter: /\.json$/ }, async args => {
			const fs = require('node:fs/promises');
			const jsonContent = await fs.readFile(args.path, 'utf8');
			const minifiedContent = JSON.stringify(JSON.parse(jsonContent));
			return {
				contents: minifiedContent,
				loader: 'copy'
			};
		});
	}
};

const baseConfig = {
	keepNames: true,
	minify: true,
	plugins: [minifyJsonPlugin],
	external: ['node-fetch'],
	loader: {
		'.json': 'copy'
	}
};

esbuild
	.build({
		...baseConfig,
		entryPoints: ['src/index.ts'],
		bundle: true,
		outdir: 'dist/cjs',
		sourcemap: true,
		platform: 'node',
		format: 'cjs',
		target: 'node20',
		outExtension: { '.js': '.cjs' }
	})
	.catch(() => process.exit(1));

esbuild
	.build({
		...baseConfig,
		entryPoints: ['./src/index.ts'],
		bundle: true,
		sourcemap: true,
		format: 'esm',
		target: 'esnext',
		outdir: './dist/esm',
		platform: 'node',
		outExtension: { '.js': '.mjs' }
	})
	.catch(() => process.exit(1));
