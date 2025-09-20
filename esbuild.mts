import { existsSync } from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type BuildOptions, build } from 'esbuild';

const STATIC_DEFINE = {
	__BOT_TYPE__: existsSync(path.resolve(dirname(fileURLToPath(import.meta.url)), './src/lib/bso')) ? '"BSO"' : '"OSB"'
};

const external = [
	'@prisma/client',
	'@sentry/node',
	'skia-canvas',
	'sonic-boom',
	'bufferutil',
	'discord.js',
	'@prisma/robochimp',
	'oldschooljs',
	'dotenv',
	'micromatch',
	'node-cron',
	'piscina'
];

const baseBuildOptions: BuildOptions = {
	bundle: true,
	format: 'esm',
	outExtension: { '.js': '.js' },
	legalComments: 'none',
	platform: 'node',
	treeShaking: false,
	loader: {
		'.node': 'file'
	},
	target: 'node20',
	external,
	define: STATIC_DEFINE,
	sourcemap: 'inline'
};

build({
	...baseBuildOptions,
	entryPoints: [
		'src/index.ts',
		'src/lib/safeglobals.ts',
		'src/lib/globals.ts',
		'src/lib/MUser.ts',
		'src/lib/ActivityManager.ts'
	],
	outdir: './dist'
});

// Workers
build({
	...baseBuildOptions,
	entryPoints: [
		'src/lib/workers/kill.worker.ts',
		'src/lib/workers/finish.worker.ts',
		'src/lib/workers/casket.worker.ts'
	],
	outdir: './dist/lib/workers'
});
