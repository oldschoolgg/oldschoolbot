import { gitHash } from '../constants';

let { pid } = process;

export function log(message: string) {
	console.log(`[${pid}] [${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}] ${message}`);
}

export function startLog() {
	log(`Starting... Git[${gitHash}] Pid[${pid}]`);
}
