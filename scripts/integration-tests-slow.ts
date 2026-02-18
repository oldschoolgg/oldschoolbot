import { spawn } from 'node:child_process';

const child = spawn('pnpm', ['test:integration'], {
	shell: true,
	stdio: 'inherit',
	env: {
		...process.env,
		VITEST_INTEGRATION_MAX_WORKERS: '1',
		VITEST_INTEGRATION_MAX_CONCURRENCY: '1',
		ALL_COMMANDS_BASE_CONCURRENCY: '1'
	}
});

child.on('exit', code => {
	process.exit(code ?? 1);
});
