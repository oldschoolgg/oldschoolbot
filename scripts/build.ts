import '../src/lib/safeglobals';

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';

import { production } from '../src/config';
import { BOT_TYPE } from '../src/lib/constants';
import { customItems } from '../src/lib/customItems/util.js';
import { getSystemInfo } from '../src/lib/systemInfo';
import { itemNameFromID } from '../src/lib/util.js';
import { renderCreatablesFile } from './renderCreatablesFile.js';
import { execAsync, runTimedLoggedFn } from './scriptUtil.js';

const args = process.argv.slice(2);

const hasArg = (arg: string) => args.includes(arg);

const forceRebuild = hasArg('--clean');

if (!existsSync('./cache.json')) {
	writeFileSync('./cache.json', `${JSON.stringify({}, null, '	')}\n`);
}
const currentCache = JSON.parse(readFileSync('./cache.json', 'utf-8'));

function doHash(string: string | Buffer) {
	return createHash('sha256').update(string).digest('hex');
}

function getFileHash(filePath: string) {
	try {
		return doHash(readFileSync(filePath));
	} catch {
		return null;
	}
}

function getCacheHash(cachePath: string, key: string): string | null {
	if (!existsSync(cachePath)) return null;
	const cache = JSON.parse(readFileSync(cachePath, 'utf-8'));
	return cache[key] || null;
}

function setCacheValue(key: string, value: string | number) {
	if (process.env.TEST) return;
	const cache = JSON.parse(readFileSync(cacheFilePath, 'utf-8'));
	cache[key] = value;
	writeFileSync(cacheFilePath, `${JSON.stringify(cache, null, '	')}\n`);
}

function shouldGeneratePrismaClient(
	schemaPath: string,
	cachePath: string,
	cacheKey: string,
	clientPath: string
): boolean {
	if (!existsSync(clientPath)) return true;
	const currentHash = getFileHash(schemaPath);
	const cachedHash = getCacheHash(cachePath, cacheKey);
	if (currentHash !== cachedHash) {
		setCacheValue(cacheKey, currentHash!);
		return true;
	}
	return false;
}

const cacheFilePath = './cache.json';

async function handlePrismaClientGeneration() {
	const prismaSchemaPaths = [
		{ schema: 'prisma/robochimp.prisma', client: 'node_modules/@prisma/client', key: 'robochimpPrismaSchemaHash' },
		{ schema: 'prisma/schema.prisma', client: 'node_modules/@prisma/robochimp', key: `${BOT_TYPE}SchemaHash` }
	];

	let shouldRunGen = false;
	for (const { schema, client, key } of prismaSchemaPaths) {
		if (shouldGeneratePrismaClient(schema, cacheFilePath, key, client)) {
			shouldRunGen = true;
			break;
		}
	}

	if (shouldRunGen || forceRebuild) {
		await Promise.all([
			execAsync('yarn prisma generate --no-hints --schema prisma/robochimp.prisma'),
			execAsync('yarn prisma db push')
		]);
	}
}

async function checkForWipingDistFolder() {
	const allTypescriptFiles = await fg('**/**/*.ts', { cwd: path.join('src'), onlyFiles: true });
	allTypescriptFiles.sort();
	const hash = doHash(allTypescriptFiles.join('\n'));
	if (currentCache.typescriptFilesHash !== hash || forceRebuild) {
		console.log('   Removing dist folder');
		await execAsync('yarn wipedist');
		setCacheValue('typescriptFilesHash', hash);
	}
}

async function handleTypescriptCompilation() {
	await execAsync('yarn build:tsc');
}

async function handleCommandsJSON() {
	const cmdFile = `data/${BOT_TYPE.toLowerCase()}.commands.json`;
	const currentFileHash = getFileHash(cmdFile);
	if (currentFileHash === null || currentCache.commandsHash !== currentFileHash) {
		console.log('   Updating commands json file');
		const { commandsFile } = await import('./renderCommandsFile.js');
		await commandsFile();
		setCacheValue('commandsHash', getFileHash(cmdFile)!);
	}
}

async function main() {
	if (production || process.env.NODE_ENV === 'production') {
		throw new Error("Don't run build script in production!");
	}
	console.log((await getSystemInfo()).singleStr);
	await runTimedLoggedFn('Prisma Client / Wipe Dist', () =>
		Promise.all([handlePrismaClientGeneration(), checkForWipingDistFolder()])
	);
	await runTimedLoggedFn('Yarn Installation', () => execAsync('yarn'));
	await runTimedLoggedFn('Typescript Compilation', handleTypescriptCompilation);
	await runTimedLoggedFn('Post Build', () => Promise.all([handleCommandsJSON()]));
	renderCreatablesFile();
	writeFileSync(
		'data/bso_items.json',
		JSON.stringify(
			customItems.reduce(
				(acc, id) => {
					acc[id] = itemNameFromID(id)!;
					return acc;
				},
				{} as Record<number, string>
			),
			null,
			4
		),
		'utf-8'
	);
	await execAsync('yarn lint');
}

runTimedLoggedFn('Build', main);
