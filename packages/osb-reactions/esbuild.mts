import { type BuildOptions, build } from 'esbuild';

const external = [
	'@prisma/client',
	'@prisma/robochimp',
	'dotenv',
	'node:*',
	'@prisma/adapter-pg',
	'oldschooljs',
	'@discordjs/rest',
	'@discordjs/ws',
	'ws',
	'ioredis',
	'@discordjs/builders',
	'@oldschoolgg/discord',
	'@sapphire/discord-utilities'
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
