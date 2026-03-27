import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { config as loadDotEnv } from 'dotenv';

loadDotEnv({ path: path.resolve(process.cwd(), '.env') });
loadDotEnv({ path: path.resolve(process.cwd(), '.env.test') });
const port = process.env.HTTP_PORT ?? '3002';

const env = {
	...process.env,
	HTTP_PORT: port
};

if (process.platform === 'win32') {
	spawnSync(
		'powershell',
		[
			'-NoProfile',
			'-Command',
			`$p=(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1); if ($p) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue }`
		],
		{ stdio: 'inherit' }
	);
}

console.log(`[wiki:testbot] API port: ${port}`);
console.log(`[wiki:testbot] Docs API: http://localhost:${port}`);
console.log(`[wiki:testbot] Mode: ${env.USE_REAL_PG === '1' ? 'real-postgres' : 'pglite'}`);

const robochimp = spawn('pnpm', ['--filter', '@oldschoolgg/robochimp', 'dev'], {
	stdio: 'inherit',
	shell: true,
	env
});

const docs = spawn('pnpm', ['--filter', 'docs', 'dev'], {
	stdio: 'inherit',
	shell: true,
	env: { ...env, PUBLIC_MINION_API_URL: `http://localhost:${port}` }
});

let shuttingDown = false;
function shutdown() {
	if (shuttingDown) return;
	shuttingDown = true;
	robochimp.kill();
	docs.kill();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

robochimp.on('exit', code => {
	if (!shuttingDown) {
		console.error(`[wiki:testbot] robochimp exited (${code ?? 'null'})`);
		shutdown();
		process.exit(code ?? 1);
	}
});

docs.on('exit', code => {
	if (!shuttingDown) {
		console.error(`[wiki:testbot] docs exited (${code ?? 'null'})`);
		shutdown();
		process.exit(code ?? 1);
	}
});
