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
	'dotenv',
	'micromatch',
	'node-cron',
	'piscina',
	'node:*'
];

const baseBuildOptions: BuildOptions = {
	bundle: true,
	format: 'esm',
	outExtension: { '.js': '.js' },
	legalComments: 'none',
	platform: 'node',
	treeShaking: true,
	loader: {
		'.node': 'file'
	},
	target: 'node24.8.0',
	external,
	define: STATIC_DEFINE,
	sourcemap: 'inline',
	minify: true,
	metafile: true
};

build({
	...baseBuildOptions,
	entryPoints: ['src/index.ts'],
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
