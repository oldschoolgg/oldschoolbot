import { exec as execNonPromise } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { Stopwatch } from '@sapphire/stopwatch';
import fg from 'fast-glob';
import { BOT_TYPE } from '../lib/constants';

const args = process.argv.slice(2);

const hasArg = (arg: string) => args.includes(arg);

const forceRebuild = hasArg('--clean');

async function runTimedLoggedFn(name: string, fn: () => Promise<unknown>) {
	const stopwatch = new Stopwatch();
	stopwatch.start();
	await fn();
	stopwatch.stop();
	console.log(`Finished ${name} in ${stopwatch.toString()}`);
}

const rawExecAsync = promisify(execNonPromise);

async function execAsync(command: string) {
	try {
		console.log('   Running command:', command);
		const result = await rawExecAsync(command);
		if (result.stderr) {
			console.error(result.stderr);
		}
	} catch (err) {
		console.error(err);
	}
}

const currentCache = JSON.parse(readFileSync('./cache.json', 'utf-8'));

function doHash(string: string | Buffer) {
	return createHash('sha256').update(string).digest('hex');
}

function getFileHash(filePath: string): string {
	return doHash(readFileSync(filePath));
}

function getCacheHash(cachePath: string, key: string): string | null {
	if (!existsSync(cachePath)) return null;
	const cache = JSON.parse(readFileSync(cachePath, 'utf-8'));
	return cache[key] || null;
}

function setCacheValue(key: string, value: string | number) {
	const cache = JSON.parse(readFileSync(cacheFilePath, 'utf-8'));
	cache[key] = value;
	writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2));
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
		setCacheValue(cacheKey, currentHash);
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
		await execAsync('yarn gen');
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

async function handleCreatables() {
	const allCreatablesFiles = await fg(['./src/lib/data/creatables/*.ts', './src/lib/data/creatables.ts'], {
		cwd: path.join('src'),
		onlyFiles: true
	});
	const hash = doHash(allCreatablesFiles.join('\n'));
	if (currentCache.creatablesHash !== hash || forceRebuild) {
		console.log('   Rebuilding creatables.txt file');
		const { renderCreatablesFile } = await import('./renderCreatablesFile');
		await renderCreatablesFile();
		setCacheValue('creatablesHash', hash);
	}
}

async function handleCommandsJSON() {
	const currentFileHash = getFileHash(`./src/lib/data/${BOT_TYPE}.commands.json`);
	if (currentCache.commandsHash !== currentFileHash || forceRebuild) {
		console.log('   Updating commands json file');
		const { commandsFile } = await import('./renderCommandsFile');
		await commandsFile();
		setCacheValue('commandsHash', currentFileHash);
	}
}

async function main() {
	await runTimedLoggedFn('Prisma Client / Wipe Dist', () =>
		Promise.all([handlePrismaClientGeneration(), checkForWipingDistFolder()])
	);
	await runTimedLoggedFn('Typescript Compilation', handleTypescriptCompilation);
	await runTimedLoggedFn('Post Build', () => Promise.all([handleCreatables(), handleCommandsJSON()]));
}

runTimedLoggedFn('Build', main);
