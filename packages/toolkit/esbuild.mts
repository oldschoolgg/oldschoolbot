import { build } from "esbuild";
import type { BuildOptions } from "esbuild";

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
	'src/util/runescape.ts',
	'src/rng/index.ts'
];

const baseConfig: BuildOptions = {
	bundle: false,
	keepNames: true,
	metafile: true,
	legalComments: 'none',
	entryPoints,
	platform: 'node',
	loader: {
		'.json': 'copy'
	},
	target: 'node20'
};

build({
		...baseConfig,
		outdir: 'dist/esm',
		format: 'esm',
		outExtension: { '.js': '.mjs' },
		target: 'node20'
	})
	.catch(() => process.exit(1));

build({
		...baseConfig,
		outdir: 'dist/cjs',
		outExtension: { '.js': '.cjs' },
		format: 'cjs',
		target: 'esnext'
	})
	.catch(() => process.exit(1));
