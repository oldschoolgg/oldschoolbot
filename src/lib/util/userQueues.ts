import PromiseQueue from 'p-queue';

import { userQueues } from '@/lib/cache.js';

function getUserUpdateQueue(userID: string) {
	const currentQueue = userQueues.get(userID);
	if (!currentQueue) {
		const queue = new PromiseQueue({ concurrency: 1 });
		userQueues.set(userID, queue);
		return queue;
	}
	return currentQueue;
}

export async function userQueueFn<T>(userID: string, fn: () => Promise<T>): Promise<T> {
	const queue = getUserUpdateQueue(userID);
	return new Promise<T>((resolve, reject) => {
		queue.add(() => {
			return fn()
				.then(resolve)
				.catch(e => {
					Logging.logError(e);
					reject(e);
				});
		});
	});
}
