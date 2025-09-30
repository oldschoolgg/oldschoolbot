import { deepMerge } from '@oldschoolgg/toolkit';
import { captureException } from '@sentry/node';

import { globalConfig } from '@/lib/constants.js';

export function assert(condition: boolean, desc?: string, context?: Record<string, string>) {
	if (!condition) {
		if (globalConfig.isProduction) {
			logError(new Error(desc ?? 'Failed assertion'), context);
		} else {
			throw new Error(desc ?? 'Failed assertion');
		}
	}
}

export function logError(err: any, context?: Record<string, string | number>, extra?: Record<string, string | number>) {
	const metaInfo = deepMerge(context ?? {}, extra ?? {});
	if (err?.requestBody?.files) {
		err.requestBody = [];
	}
	if (err?.requestBody?.json) {
		err.requestBody.json = String(err.requestBody.json).slice(0, 500);
	}
	console.error(
		JSON.stringify({
			type: 'ERROR',
			error: err.stack ?? err.message,
			info: metaInfo
		})
	);

	if (globalConfig.isProduction) {
		captureException(err, {
			tags: context,
			extra: metaInfo
		});
	}

	if (process.env.TEST) {
		throw err;
	}
}
