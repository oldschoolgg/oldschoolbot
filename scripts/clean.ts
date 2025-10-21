import { execSync } from 'node:child_process';
import { globSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { styleText } from 'node:util';

const args = process.argv.slice(2);
const dry = args.includes('--dry');

function del(pattern: string) {
	const matches = globSync(pattern);
	for (const p of matches) {
		if (dry) {
			console.log('[dry]', p);
			continue;
		}
		try {
			rmSync(p, { recursive: true, force: true });
			console.log('Deleted:', p);
		} catch (err) {
			console.error(styleText(['bold', 'red'], 'Error deleting:'), p, (err as Error).message);
		}
	}
}

const root = process.cwd();
const fileGlobsToDelete = ['**/dist', '**/node_modules', '**/*.tsbuildinfo', '**/.db'];

for (const pattern of fileGlobsToDelete) {
	console.log(styleText(['italic'], `Deleting all files matching: ${pattern}...`));
	del(join(root, pattern));
}

function safeExec(cmd: string): string {
	try {
		return execSync(cmd, { encoding: 'utf8' }).trim();
	} catch (err) {
		return styleText(['red'], `[Error: ${(err as Error).message}]`);
	}
}

type DebugEntry = {
	key: string;
	value: string;
	color?: (val: string) => string;
};

const debugData: DebugEntry[] = [
	{
		key: 'Node Version',
		value: process.version,
		color: val => {
			const isCorrect = val.startsWith('v24');
			return styleText([isCorrect ? 'green' : 'red'], val);
		}
	},
	{
		key: 'PNPM Version',
		value: safeExec('pnpm -v'),
		color: val => {
			const isCorrect = val.startsWith('10.');
			return styleText([isCorrect ? 'green' : 'red'], val);
		}
	},
	{ key: 'Git Branch', value: safeExec('git branch --show-current') },
	{
		key: 'Git Commit',
		value: `${safeExec('git log -1 --pretty=%B').replaceAll('\n', ' ')} ${safeExec('git rev-parse HEAD').slice(0, 7)}`
	}
];

function printDebug(entries: DebugEntry[]) {
	let result = '';
	for (const { key, value, color } of entries) {
		const fmtKey = styleText(['bold', 'green'], `${key}:`.toUpperCase());
		const fmtVal = color ? color(value) : value;
		result += `${fmtKey} ${fmtVal}\n`;
	}
	return result;
}

console.log(`\n${printDebug(debugData).trim()}

${styleText(['bold'], 'Next Steps:')}
pnpm install
pnpm gen`);
