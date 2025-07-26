const esbuild = require('esbuild');

const entryPoints = [
	'src/util.ts',
	'src/structures.ts',
	'src/constants.ts',
	'src/testBotWebsocket.ts',
	'src/util/datetime.ts',
	'src/string-util.ts',
	'src/discord-util.ts'
];

const baseConfig = {
	keepNames: true,
	minify: true,
	treeShaking: true,
	bundle: true,
	entryPoints,
	platform: 'node',
	sourcemap: true,
	external: ['discord.js'],
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
