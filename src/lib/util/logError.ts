import { captureException } from '@sentry/node';

import { production } from '../../config';

export function logError(err: Error | unknown, context?: Record<string, string>) {
	if (production) {
		captureException(err, {
			extra: context
		});
	} else {
		console.error(err);
	}
}
