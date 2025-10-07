import { type BuildOptions, build } from 'esbuild';

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
	'node:*',
	'pglite-prisma-adapter',
	'@electric-sql/pglite',
	'pg'
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
