import { exec as execNonPromise } from 'node:child_process';
import { promisify } from 'node:util';

const rawExecAsync = promisify(execNonPromise);

async function lintScript() {
	await Promise.all([
		rawExecAsync('biome check --write --unsafe --diagnostic-level=error'),
		rawExecAsync('prettier --use-tabs --write "**/*.{yaml,yml,css,html}"')
	]);
}

lintScript();
