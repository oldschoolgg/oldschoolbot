const esbuild = require('esbuild');

const entryPoints = [
	'src/util.ts',
	'src/structures.ts',
	'src/constants.ts',
	'src/testBotWebsocket.ts',
	'src/util/datetime.ts',
	'src/string-util.ts',
	'src/util/discord/index.ts',
	'src/util/math/index.ts',
	'src/util/node.ts',
	'src/util/runescape.ts'
];

const baseConfig = {
	minify: false,
	treeShaking: true,
	bundle: true,
	keepNames: true,
	metafile: true,
	legalComments: 'none',
	entryPoints,
	platform: 'node',
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
