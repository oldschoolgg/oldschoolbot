import { default as pinoCtor } from 'pino';

import { BOT_TYPE, gitHash } from '../constants';

const pino = pinoCtor(
	{
		level: 'debug',
		base: {
			pid: process.pid,
			gitHash
		}
	},
	pinoCtor.destination({
		dest: `./${BOT_TYPE}-debug-logs.log`,
		minLength: 4096
	})
);

interface LogContext {
	type: string;
	[key: string]: unknown;
}

function _debugLog(str: string, context: LogContext) {
	pino.debug({ ...context, message: str });
}
declare global {
	const debugLog: typeof _debugLog;
}
declare global {
	namespace NodeJS {
		interface Global {
			debugLog: typeof _debugLog;
		}
	}
}

global.debugLog = _debugLog;
