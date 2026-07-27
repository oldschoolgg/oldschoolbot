import { globalConfig } from '@/lib/constants.js';

export function assert(condition: boolean, desc?: string, context?: Record<string, string>) {
	if (!condition) {
		if (globalConfig.isProduction) {
			Logging.logError(new Error(desc ?? 'Failed assertion'), context);
		} else {
			throw new Error(desc ?? 'Failed assertion');
		}
	}
}
