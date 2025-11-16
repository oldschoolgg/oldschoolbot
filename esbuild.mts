import { type BuildOptions, build } from 'esbuild';

const baseBuildOptions: BuildOptions = {
	bundle: true,
	format: 'esm',
	legalComments: 'none',
	platform: 'node',
	loader: {
		'.node': 'file'
	},
	target: 'node24.8.0',
	sourcemap: 'inline',
	minify: false,
	metafile: true,
	packages: 'external'
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
