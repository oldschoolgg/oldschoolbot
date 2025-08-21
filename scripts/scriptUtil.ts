import { type ExecOptions, exec as execNonPromise } from 'node:child_process';
import { promisify } from 'node:util';
import { Stopwatch } from '@oldschoolgg/toolkit/structures';
import { Bank, type ItemBank } from 'oldschooljs';

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

export async function runTimedLoggedFn(name: string, fn: () => unknown) {
	const stopwatch = new Stopwatch();
	console.log(`Starting ${name}...`);
	await fn();
	stopwatch.stop();
	console.log(`${name} completed in ${stopwatch.toString()}`);
}

export function getItemNamesFromBank(bank: Bank | ItemBank): string[] {
	if (bank instanceof Bank) {
		return bank
			.items()
			.map(i => i[0].name)
			.sort((a, b) => a.localeCompare(b));
	}
	return getItemNamesFromBank(new Bank(bank));
}
