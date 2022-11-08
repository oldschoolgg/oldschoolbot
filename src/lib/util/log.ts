import { execSync } from 'child_process';

let { pid } = process;

export function log(message: string) {
	console.log(`[${pid}] [${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}] ${message}`);
}

export function startLog() {
	const gitHash = execSync('git rev-parse HEAD').toString().trim();
	log(`Starting... Git[${gitHash}] Pid[${pid}]`);
}
