import { type BuildOptions, build } from 'esbuild';

const external = [
	'@prisma/client',
	'discord.js',
	'@prisma/robochimp',
	'dotenv',
	'node:*',
	'@prisma/robochimp',
	'@prisma/osb',
	'@prisma/bso',
	'micromatch',
	'fastify',
	'fastify-raw-body',
	'@fastify/cors',
	'@prisma/adapter-pg'
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
	minify: false,
	metafile: true
};

build({
	...baseBuildOptions,
	entryPoints: ['src/index.ts'],
	outdir: './dist'
});
