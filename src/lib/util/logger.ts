import SonicBoomDefault from 'sonic-boom';

const { SonicBoom } = SonicBoomDefault;

import { isObject, UserError } from '@oldschoolgg/toolkit';
import { captureException } from '@sentry/node';
import { DiscordAPIError } from 'discord.js';

import { BOT_TYPE_LOWERCASE, globalConfig } from '@/lib/constants.js';

const LOG_FILE_NAME = globalConfig.isProduction
	? `../logs/${BOT_TYPE_LOWERCASE}.debug.log`
	: `./logs/${BOT_TYPE_LOWERCASE}.debug.log`;

export const sonicBoom = new SonicBoom({
	fd: LOG_FILE_NAME,
	mkdir: true,
	sync: false
});

interface LogContext {
	type?: string;
	[key: string]: unknown;
}

function logDebug(str: string, context: LogContext = {}) {
	const o = { ...context, m: str, t: new Date().toISOString() };
	if (!globalConfig.isProduction) {
		console.log(str);
	} else {
		sonicBoom.write(`${JSON.stringify(o)}\n`);
	}
}

type RichErrorLogArgs = {
	err: any;
	interaction?: MInteraction;
	context?: Record<
		string,
		string | number | null | boolean | unknown | Record<string, string | number | null | boolean>
	>;
};

function logError(error: Error, context?: LogContext): void;
function logError(errorMessage: string, context?: LogContext): void;
function logError(args: RichErrorLogArgs): void;
function logError(args: string | Error | RichErrorLogArgs, ctx?: LogContext): void {
	const err = typeof args === 'string' ? new Error(args) : args instanceof Error ? args : args.err;
	const interaction = isObject(args) && !(args instanceof Error) ? args.interaction : undefined;
	const context = isObject(args) && !(args instanceof Error) ? args.context : ctx;
	if (err instanceof Error && err.message === 'SILENT_ERROR') return;

	// If DiscordAPIError #10008, that means someone deleted the message, we don't need to log this.
	if (err instanceof DiscordAPIError && err.code === 10_008) {
		return;
	}

	if (err instanceof UserError && interaction && interaction.isRepliable()) {
		interaction.reply({ content: err.message });
		return;
	}

	const metaInfo: RichErrorLogArgs['context'] = { ...context };
	if (err?.requestBody?.files) {
		err.requestBody = [];
	}
	if (err?.requestBody?.json) {
		err.requestBody.json = String(err.requestBody.json).slice(0, 500);
	}
	if (interaction) {
		metaInfo.interaction = interaction.getDebugInfo();
	}
	console.error(err);
	console.error(
		JSON.stringify({
			type: 'ERROR',
			error: err.stack ?? err.message,
			info: metaInfo
		})
	);

	if (globalConfig.isProduction) {
		captureException(err, {
			extra: {
				metaInfo: JSON.stringify(metaInfo)
			}
		});
	}

	if (process.env.TEST) {
		throw err;
	}
}

const LoggingGlobal = {
	logError,
	logDebug
};

declare global {
	var Logging: typeof LoggingGlobal;
}

global.Logging = LoggingGlobal;
