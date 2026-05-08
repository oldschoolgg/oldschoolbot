const start = performance.now();

import { spawn } from 'node:child_process';
import process from 'node:process';

function log(message: string) {
	const time = performance.now() - start;
	console.log(`[${(time / 1000).toFixed(1)}s] ${message}`);
}

function run(cmd: string[], opts = {}): Promise<void> {
	return new Promise((resolve, reject) => {
		const child = spawn(cmd[0], cmd.slice(1), { shell: true, stdio: 'inherit', ...opts });

		let stderr = '';
		let stdout = '';

		child.stdout?.on('data', d => {
			stdout += d.toString();
		});
		child.stderr?.on('data', d => {
			stderr += d.toString();
		});
		child.on('exit', code => {
			if (code === 0) resolve();
			else
				reject(
					new Error(
						`Command "${cmd.join(' ')}" failed with exit code ${code}. \n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`
					)
				);
		});
	});
}

async function pushSchemas() {
	await Promise.all([
		run(['pnpm', 'prisma', 'db', 'push', '--schema=./prisma/schema.prisma', '--skip-generate', '--force-reset'], {
			stdio: 'ignore'
		}),
		run(['pnpm', 'prisma', 'db', 'push', '--schema=./prisma/robochimp.prisma', '--skip-generate', '--force-reset'], {
			stdio: 'ignore'
		})
	]);
}

try {
	await run(['docker', 'compose', 'up', '-d', 'db', 'redis'], { stdio: 'ignore' });
} catch {}
log(`Docker containers started.`);

await pushSchemas();
log(`Database schemas pushed.`);

const rawArgs: string[] = process.argv.slice(2);
const economyOnly = rawArgs.includes('--economy-only');
const otherArgs = rawArgs.filter(arg => arg !== '--economy-only');
const sharedEnv = { ...process.env, NODE_NO_WARNINGS: '1' };

if (!economyOnly) {
	log('Running integration section.');
	await run(['pnpm', 'vitest', 'run', '--config', 'vitest.integration.config.mts', ...otherArgs], {
		env: sharedEnv
	});
}

if (!economyOnly) {
	await pushSchemas();
	log('Database schemas reset for economy section.');
}

log('Running economy integration section (serial).');
await run(['pnpm', 'vitest', 'run', '--config', 'vitest.integration.economy.config.mts', ...otherArgs], {
	env: sharedEnv
});
