import { exec as execNonPromise } from 'node:child_process';
import { promisify } from 'node:util';

const rawExecAsync = promisify(execNonPromise);

async function lintScript() {
	await Promise.all([
		rawExecAsync('biome check --write --unsafe --diagnostic-level=error'),
		rawExecAsync('prettier --use-tabs --write "**/*.{yaml,yml,css,html}"'),
		rawExecAsync('prisma format --schema ./prisma/robochimp.prisma'),
		rawExecAsync('prisma format --schema ./prisma/schema.prisma')
	]);
}

lintScript();
