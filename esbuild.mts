import { existsSync } from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { esbuildPluginFilePathExtensions } from 'esbuild-plugin-file-path-extensions';

const STATIC_DEFINE = {
	__BOT_TYPE__: existsSync(path.resolve(dirname(fileURLToPath(import.meta.url)), './src/lib/bso')) ? '"BSO"' : '"OSB"'
};

import type { BuildOptions } from 'esbuild';

import type { Plugin } from 'esbuild';

function wrappedFilePathExtensionsPlugin(opts = {}): Plugin {
  const inner = esbuildPluginFilePathExtensions(opts);

  return {
    name: 'wrapped-file-path-extensions',
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {

        if (args.path.includes('@prisma/')) {
           return {
            path: args.path,
            external: true
          };
        }
      });

      return inner.setup(build);
    }
  };
}

const external = ['@prisma/client','@sentry/node','skia-canvas','sonic-boom','bufferutil','discord.js', '@prisma/robochimp', 'oldschooljs'];

const baseBuildOptions: BuildOptions = {
	bundle: true,
	format: 'esm',
	outExtension: { '.js': '.js' },
	plugins: [wrappedFilePathExtensionsPlugin({ esm: true, esmExtension: 'js' })],
	legalComments: 'none',
	platform: 'node',
	treeShaking: false,
	loader: {
		'.node': 'file'
	},
	target: 'node20',
	external,
	define: STATIC_DEFINE,
	sourcemap: 'inline',
};

build({
	...baseBuildOptions,
	entryPoints: ['src/index.ts', 'src/lib/safeglobals.ts', 'src/lib/globals.ts', 'src/lib/MUser.ts', 'src/lib/ActivityManager.ts'],
	outdir: './dist',
	// logLevel: 'error',
	// alias: {
	// 	'@': path.resolve(import.meta.dirname, './src')
	// },
});

// Workers
build({
	...baseBuildOptions,
	entryPoints: [
		'src/lib/workers/kill.worker.ts',
		'src/lib/workers/finish.worker.ts',
		'src/lib/workers/casket.worker.ts'
	],
	outdir: './dist/lib/workers',
	// alias: {
	// 	'@': path.resolve(import.meta.dirname, './src')
	// },
});
