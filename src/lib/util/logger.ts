import { DiscordAPIError } from '@discordjs/rest';
import SonicBoomDefault from 'sonic-boom';

const { SonicBoom } = SonicBoomDefault;

import path from 'node:path';
import { isObject, UserError } from '@oldschoolgg/toolkit';

import { BOT_TYPE_LOWERCASE, globalConfig } from '@/lib/constants.js';
import type { MInteraction } from '@/lib/discord/interaction/MInteraction.js';

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
		// TODO
		// ...(interaction ? { interaction: MInteraction.getInteractionDebugInfo(interaction) } : undefined)
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
	if (process.env.CI) return;
	const o = { ...context, m: str, t: new Date().toISOString() };
	sonicBoom.write(`${JSON.stringify(o)}\n`);
	if (!globalConfig.isProduction) {
		console.log(str);
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

	if (err instanceof UserError && interaction && !interaction.replied) {
		Logging.logDebug('UserError encountered, sending message to user.', {
			error: err.message,
			user_id: interaction.userId
		});
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
		// TODO
		// metaInfo.interaction = interaction.getDebugInfo();
	}
	if (!globalConfig.isProduction) {
		console.error(err);
	}
	console.error(
		JSON.stringify({
			type: 'ERROR',
			error: err.stack ?? err.message,
			info: metaInfo,
			time: new Date().toISOString()
		})
	);

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
