import SonicBoom from 'sonic-boom';

import { BOT_TYPE } from '../constants';

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, '0');
const day = today.getDate().toString().padStart(2, '0');
const formattedDate = `${year}-${month}-${day}`;

export const LOG_FILE_NAME = `./logs/${formattedDate}-${today.getHours()}-${today.getMinutes()}-${BOT_TYPE}-debug-logs.log`;

export const sonicBoom = new SonicBoom({
	fd: LOG_FILE_NAME,
	mkdir: true,
	minLength: 4096,
	sync: false
});

const sqlLogger = new SonicBoom({
	fd: './logs/queries.sql',
	mkdir: true,
	minLength: 0,
	sync: true
});

export const sqlLog = (str: string) => sqlLogger.write(`${new Date().toLocaleTimeString()} ${str}\n`);

interface LogContext {
	type?: string;
	[key: string]: unknown;
}

function _debugLog(str: string, context: LogContext = {}) {
	if (process.env.TEST) return;
	const o = { ...context, m: str, t: new Date().toISOString() };
	sonicBoom.write(`${JSON.stringify(o)}\n`);
}
declare global {
	var debugLog: typeof _debugLog;
}

global.debugLog = _debugLog;
