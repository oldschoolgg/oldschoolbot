import { useEffect } from 'react';

import { handleError } from './handleError.ts';

export function useGlobalErrorHandler() {
	useEffect(() => {
		const handleGlobalError = (event: ErrorEvent) => {
			console.error('handleGlobalError', event);
			handleError(event.error || new Error(event.message));
		};

		const handleResourceError = (event: Event) => {
			console.error('handleResourceError', event);
			handleError(new Error('Resource Load Error'), { event });
		};

		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			console.error('handleUnhandledRejection', event);
			handleError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
		};

		window.addEventListener('error', handleGlobalError);
		window.addEventListener('error', handleResourceError, true);
		window.addEventListener('unhandledrejection', handleUnhandledRejection);

		return () => {
			window.removeEventListener('error', handleGlobalError);
			window.removeEventListener('error', handleResourceError, true);
			window.removeEventListener('unhandledrejection', handleUnhandledRejection);
		};
	}, []);
}
