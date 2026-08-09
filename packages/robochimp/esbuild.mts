import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
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
	'fastify',
	'fastify-raw-body',
	'@fastify/cors',
	'@prisma/adapter-pg',
	'oldschooljs',
	'@discordjs/rest',
	'@discordjs/ws',
	'ws',
	'ioredis',
	'@discordjs/builders',
	'@oldschoolgg/discord'
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

await build({
	...baseBuildOptions,
	entryPoints: ['src/index.ts'],
	outdir: './dist'
});

const distDir = resolve(process.cwd(), './dist');
const require = createRequire(import.meta.url);
const pgliteEntrypoint = require.resolve('@electric-sql/pglite');
const pgliteDistDir = dirname(pgliteEntrypoint);

for (const asset of ['pglite.data', 'pglite.wasm']) {
	const src = resolve(pgliteDistDir, asset);
	const dest = resolve(distDir, asset);
	mkdirSync(dirname(dest), { recursive: true });
	copyFileSync(src, dest);
}
