import SonicBoom from 'sonic-boom';

import { BOT_TYPE_LOWERCASE, globalConfig } from '../constants';

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, '0');
const day = today.getDate().toString().padStart(2, '0');
const formattedDate = `${year}-${month}-${day}`;

const LOG_FILE_NAME = globalConfig.isProduction
	? `../logs/${BOT_TYPE_LOWERCASE}.debug.log`
	: `./logs/${formattedDate}-${today.getHours()}-${today.getMinutes()}-debug-logs.log`;

export const sonicBoom = new SonicBoom({
	fd: LOG_FILE_NAME,
	mkdir: true,
	sync: false
});

interface LogContext {
	type?: string;
	[key: string]: unknown;
}

function _debugLog(str: string, context: LogContext = {}) {
	if (process.env.TEST) return;
	const o = { ...context, m: str, t: new Date().toISOString() };
	if (!globalConfig.isProduction) {
		console.log(str);
	} else {
		sonicBoom.write(`${JSON.stringify(o)}\n`);
	}
}
declare global {
	var debugLog: typeof _debugLog;
}

global.debugLog = _debugLog;
