import { captureException } from '@sentry/node';

import { production } from '../../config';

export class BotError extends Error {
	public code?: string;
	constructor(message: string, name?: string, code?: string | null) {
		super(message);
		this.name = name ?? 'BotError';
		if (code) this.code = code;
	}
}

export function logError(err: Error | unknown, context?: Record<string, string>) {
	if (production) {
		captureException(err, {
			tags: context
		});
	} else {
		console.error(context, err);
	}
}
