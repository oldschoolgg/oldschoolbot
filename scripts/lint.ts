import { exec as execNonPromise } from 'node:child_process';
import { promisify } from 'node:util';

const rawExecAsync = promisify(execNonPromise);

async function lintScript() {
	await rawExecAsync('prettier --use-tabs --write "**/*.{yaml,yml,css,html}"');
	await Promise.all([
		rawExecAsync('biome check --write --diagnostic-level=error'),
		rawExecAsync('prisma format --schema ./prisma/robochimp.prisma'),
		rawExecAsync('prisma format --schema ./prisma/schema.prisma')
	]);
}

await lintScript();
