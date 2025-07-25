import { existsSync } from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const STATIC_DEFINE = {
	__BOT_TYPE__: existsSync(path.resolve(dirname(fileURLToPath(import.meta.url)), './src/lib/bso')) ? '"BSO"' : '"OSB"'
};

const external = [
	'skia-canvas',
	'@prisma/robochimp',
	'@prisma/client',
	'bufferutil',
	'oldschooljs',
	'discord.js',
	'node-fetch',
	'piscina'
];

build({
	entryPoints: ['src/index.ts'],
	sourcemap: 'inline',
	minify: true,
	legalComments: 'none',
	outdir: './dist',
	logLevel: 'error',
	bundle: true,
	platform: 'node',
	loader: {
		'.node': 'file'
	},
	external,
	alias: {
		'@': path.resolve(import.meta.dirname, './src')
	},
	define: STATIC_DEFINE
});

// Workers
build({
	entryPoints: [
		'src/lib/workers/kill.worker.ts',
		'src/lib/workers/finish.worker.ts',
		'src/lib/workers/casket.worker.ts'
	],
	sourcemap: 'inline',
	logLevel: 'error',
	bundle: true,
	minify: true,
	legalComments: 'none',
	outdir: './dist/lib/workers',
	platform: 'node',
	loader: {
		'.node': 'file'
	},
	external,
	alias: {
		'@': path.resolve(import.meta.dirname, './src')
	},
	define: STATIC_DEFINE
});
