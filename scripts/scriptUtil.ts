import { type ExecOptions, exec as execNonPromise } from 'node:child_process';
import { promisify } from 'node:util';
import { Stopwatch } from '@oldschoolgg/toolkit/structures';

const rawExecAsync = promisify(execNonPromise);

export async function execAsync(command: string | string[], options?: ExecOptions): Promise<void> {
	try {
		console.log('   Running command:', command);

		const results = Array.isArray(command)
			? await Promise.all(command.map(cmd => rawExecAsync(cmd, options)))
			: [await rawExecAsync(command, options)];

		for (const result of results) {
			if (result.stderr) {
				console.error(result.stderr);
			}
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
