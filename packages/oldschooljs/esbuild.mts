import { build } from "esbuild";
import type { BuildOptions } from "esbuild";
import { writeFileSync } from "node:fs";

const entryPoints = [
		'./src/index.ts',
		'./src/util/util.ts',
		'./src/constants.ts',
		'./src/EGear.ts',
		'./src/EItem.ts',
		'./src/EMonster.ts',
		'./src/structures/Wiki.ts',
		'./src/structures/Hiscores.ts',
		'./src/gear/index.ts'
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
	target: 'node20',
};

build({
		...baseConfig,
		outdir: 'dist/esm',
		format: 'esm',
		outExtension: { '.js': '.mjs' },
		target: 'node20'
	})
	.catch(() => process.exit(1)).then(res => {
		writeFileSync("test.json", JSON.stringify(res.metafile, null, 4));
	});

build({
		...baseConfig,
		outdir: 'dist/cjs',
		outExtension: { '.js': '.cjs' },
		format: 'cjs',
		target: 'esnext'
	})
	.catch(() => process.exit(1));
