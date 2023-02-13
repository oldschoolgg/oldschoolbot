import { default as pinoCtor } from 'pino';
import { pid } from 'process';

import { BOT_TYPE } from '../constants';

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, '0');
const day = today.getDate().toString().padStart(2, '0');
const formattedDate = `${year}-${month}-${day}`;

const pino = pinoCtor(
	{
		level: 'debug',
		base: {}
	},
	pinoCtor.destination({
		dest: `./logs/${formattedDate}-${pid}-${BOT_TYPE}-debug-logs.log`,
		minLength: 256,
		mkdir: true
	})
);

interface LogContext {
	type?: string;
	[key: string]: unknown;
}

function _debugLog(str: string, context: LogContext = {}) {
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
