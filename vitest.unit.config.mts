import path, { basename, dirname, join } from 'node:path';
import { defineConfig } from 'vitest/config';

import { STATIC_DEFINE } from './meta';

export default defineConfig({
	test: {
		name: 'Old School Bot - Unit',
		include: ['tests/unit/**/*.test.ts'],
		setupFiles: 'tests/unit/setup.ts',
		resolveSnapshotPath: (testPath, extension) =>
			join(join(dirname(testPath), 'snapshots'), `${basename(testPath)}${extension}`),
		slowTestThreshold: 0,
		isolate: false,
		pool: 'forks',
		poolOptions: {
			forks: {
				maxForks: 5,
				minForks: 5,
				execArgv: ['--disable-warning=ExperimentalWarning']
			}
		},
		coverage: {
			provider: 'v8',
			include: ['src/lib/util/parseStringBank.ts', 'src/lib/structures/Gear.ts', 'src/lib/canvas/**/*.ts'],
			reporter: ['text']
		}
	},
	resolve: {
		alias: [
			{
				find: /^@\/constants\.js$/,
				replacement: path.resolve(import.meta.dirname, './packages/oldschooljs/src/constants.ts')
			},
			{
				find: /^@\/meta\/(.*)\.js$/,
				replacement: path.resolve(import.meta.dirname, './packages/oldschooljs/src/meta/$1.ts')
			},
			{
				find: /^@\/simulation\/(.*)\.js$/,
				replacement: path.resolve(import.meta.dirname, './packages/oldschooljs/src/simulation/$1.ts')
			},
			{
				find: /^@\/structures\/(.*)\.js$/,
				replacement: path.resolve(import.meta.dirname, './packages/oldschooljs/src/structures/$1.ts')
			},
			{
				find: /^@\/util\/(.*)\.js$/,
				replacement: path.resolve(import.meta.dirname, './packages/oldschooljs/src/util/$1.ts')
			},
			{ find: '@', replacement: path.resolve(import.meta.dirname, './src') },
			{
				find: /^oldschooljs\/(.*)$/,
				replacement: path.resolve(import.meta.dirname, './packages/oldschooljs/src/$1')
			},
			{
				find: /^oldschooljs$/,
				replacement: path.resolve(import.meta.dirname, './packages/oldschooljs/src/index.ts')
			},
			{
				find: /^@oldschoolgg\/collectionlog\/(.*)$/,
				replacement: path.resolve(import.meta.dirname, './packages/collectionlog/src/$1')
			},
			{
				find: /^@oldschoolgg\/collectionlog$/,
				replacement: path.resolve(import.meta.dirname, './packages/collectionlog/src/index.ts')
			},
			{
				find: /^@oldschoolgg\/spritesheet\/(.*)$/,
				replacement: path.resolve(import.meta.dirname, './packages/spritesheet/src/$1')
			},
			{
				find: /^@oldschoolgg\/spritesheet$/,
				replacement: path.resolve(import.meta.dirname, './packages/spritesheet/src/index.ts')
			},
			{
				find: /^@oldschoolgg\/toolkit$/,
				replacement: path.resolve(import.meta.dirname, './packages/toolkit/src/util.ts')
			},
			{
				find: /^@oldschoolgg\/toolkit\/util$/,
				replacement: path.resolve(import.meta.dirname, './packages/toolkit/src/util.ts')
			},
			{
				find: /^@oldschoolgg\/toolkit\/constants$/,
				replacement: path.resolve(import.meta.dirname, './packages/toolkit/src/constants.ts')
			},
			{
				find: /^@oldschoolgg\/toolkit\/structures$/,
				replacement: path.resolve(import.meta.dirname, './packages/toolkit/src/structures.ts')
			},
			{
				find: /^@oldschoolgg\/toolkit\/test-bot-websocket$/,
				replacement: path.resolve(import.meta.dirname, './packages/toolkit/src/testBotWebsocket.ts')
			},
			{
				find: /^@oldschoolgg\/toolkit\/datetime$/,
				replacement: path.resolve(import.meta.dirname, './packages/toolkit/src/util/datetime.ts')
			},
			{
				find: /^@oldschoolgg\/toolkit\/discord-util$/,
				replacement: path.resolve(import.meta.dirname, './packages/toolkit/src/util/discord/index.ts')
			},
			{
				find: /^@oldschoolgg\/toolkit\/math$/,
				replacement: path.resolve(import.meta.dirname, './packages/toolkit/src/util/math/index.ts')
			},
			{
				find: /^@oldschoolgg\/toolkit\/string-util$/,
				replacement: path.resolve(import.meta.dirname, './packages/toolkit/src/string-util.ts')
			},
			{
				find: /^@oldschoolgg\/toolkit\/node$/,
				replacement: path.resolve(import.meta.dirname, './packages/toolkit/src/util/node.ts')
			},
			{
				find: /^@oldschoolgg\/toolkit\/runescape$/,
				replacement: path.resolve(import.meta.dirname, './packages/toolkit/src/util/runescape.ts')
			},
			{
				find: /^@oldschoolgg\/toolkit\/rng$/,
				replacement: path.resolve(import.meta.dirname, './packages/toolkit/src/rng/index.ts')
			}
		]
	},
	define: STATIC_DEFINE
});
