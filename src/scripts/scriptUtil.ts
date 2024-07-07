import { exec as execNonPromise } from 'node:child_process';
import { promisify } from 'node:util';
import { Stopwatch } from '@oldschoolgg/toolkit';

const rawExecAsync = promisify(execNonPromise);

export async function execAsync(command: string) {
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

export async function runTimedLoggedFn(name: string, fn: () => Promise<unknown>) {
	const stopwatch = new Stopwatch();
	stopwatch.start();
	await fn();
	stopwatch.stop();
	console.log(`Finished ${name} in ${stopwatch.toString()}`);
}
