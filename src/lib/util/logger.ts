import { DiscordAPIError } from '@discordjs/rest';
import SonicBoomDefault from 'sonic-boom';

const { SonicBoom } = SonicBoomDefault;

import path from 'node:path';
import {isObject, isPlainObject, UserError} from '@oldschoolgg/toolkit';

import { BOT_TYPE_LOWERCASE, globalConfig } from '@/lib/constants.js';

const LOG_FOLDER = globalConfig.isProduction ? '../logs/' : './logs/';

const baseSonicBoomOptions = {
	mkdir: true,
	sync: !globalConfig.isProduction,
	fsync: false
} as const;

const perfSonicBoom = new SonicBoom({
	fd: path.join(LOG_FOLDER, `${BOT_TYPE_LOWERCASE}.perf.log`),
	...baseSonicBoomOptions
});

export type PerformanceLogContext = {
	duration: number;
	text: string;
	interaction?: MInteraction;
	[key: string]: unknown;
};

function logPerf({ duration, text, interaction, ...rest }: PerformanceLogContext) {
	if (duration < globalConfig.minimumLoggedPerfDuration) return;
	const ctx = {
		...rest
	};
	perfSonicBoom.write(
		`${JSON.stringify({ ...ctx, duration: Math.trunc(duration), text, t: new Date().toISOString() })}\n`
	);
}

export const sonicBoom = new SonicBoom({
	fd: path.join(LOG_FOLDER, `${BOT_TYPE_LOWERCASE}.debug.log`),
	...baseSonicBoomOptions
});

interface LogContext {
	type?: string;
	[key: string]: unknown;
}

function logDebug(str: string, context: LogContext = {}) {
	if (process.env.TEST) return;
	const o = { ...context, m: str, t: new Date().toISOString() };
	sonicBoom.write(`${JSON.stringify(o)}\n`);
	if (!globalConfig.isProduction) {
		console.log(`${process.uptime()}s: ${str}`);
	}
}

interface AnyContextObj {
	type?: string;
	[p: string]: unknown;
}

type RichErrorLogArgs = {
	err: unknown;
	message?: string;
	stack?: string;
	interaction?: MInteraction;
	context?: AnyContextObj;
};

function toError(value: unknown): Error {
	if (value instanceof Error) {
		return value;
	}

	if (typeof value === 'string') {
		return new Error(value);
	}

	try {
		return new Error(JSON.stringify(value));
	} catch {
		return new Error(String(value));
	}
}

function logError(error: Error, context?: LogContext): void;
function logError(errorMessage: string, context?: LogContext): void;
function logError(args: RichErrorLogArgs): void;
function logError(args: string | Error | RichErrorLogArgs, ctx?: LogContext): void {
	function isRichError(testVar: unknown): testVar is RichErrorLogArgs {
		return isPlainObject(testVar) && 'err' in testVar;
	}
	const interaction = isRichError(args) ? args.interaction : undefined;
	const richArgs = isRichError(args) ? args : undefined;

	const err = toError(
		typeof args === 'string'
			? args
			: args instanceof Error
				? args
				: args.err,
	);



	if (err instanceof Error && err.message === 'SILENT_ERROR') return;

	// If DiscordAPIError #10008, that means someone deleted the message, we don't need to log this.
	if (err instanceof DiscordAPIError && err.code === 10_008) {
		return;
	}

	let context = richArgs?.context ?? {};
	if (ctx) context = { ...context, ...ctx };
	const message = richArgs?.message ?? err.message;
	const stack = richArgs?.stack ?? err.stack;

	const unknownInteraction = 'code' in err && err.code === 10062;

	if (!unknownInteraction && interaction) {
		Logging.logDebug('UserError encountered, sending message to user.', {
			error: err.message,
			user_id: interaction.userId
		});
		if (!interaction.replied) {
			void interaction.reply({content: err.message});
		} else {
			void interaction.followUp({content: err.message});
		}
		return;
	}

	const metaInfo: AnyContextObj = { ...context };
	if ('requestBody' in err) {
		if (err.requestBody.files) {
			metaInfo.requestBody.files = err.requestBody.files.map(file => ({ name: file.name} );
		}
	}
	if (err?.requestBody?.json) {
		err.requestBody.json = String(err.requestBody.json).slice(0, 4000);
	}

	if (!globalConfig.isProduction) {
		console.error(err);
	}

	const message = typeof args === 'string' ? args :
		'message' in args ? args.message : undefined;
	const rawObj: AnyContextObj = {
		message,
		stack: err.stack,
		error: err.message ?? err.stack,
		time: new Date().toISOString()
	};
	if (metaInfo && Object.keys(metaInfo).length > 0) {
		rawObj.info = metaInfo;
	}
	prisma.systemLogs
		.create({
			data: {
				type: 'ERROR',
				data: rawObj as any
			}
		})
		.catch(console.error);

	console.error(JSON.stringify(rawObj));

	if (process.env.TEST) {
		throw err;
	}
}

const LoggingGlobal = {
	logError,
	logDebug,
	logPerf
};

declare global {
	var Logging: typeof LoggingGlobal;
}

global.Logging = LoggingGlobal;
