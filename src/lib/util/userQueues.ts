import PromiseQueue from 'p-queue';

export const userQueues: Map<string, PromiseQueue> = new Map();
export function getUserUpdateQueue(userID: string) {
	let currentQueue = userQueues.get(userID);
	if (!currentQueue) {
		let queue = new PromiseQueue({ concurrency: 1 });
		userQueues.set(userID, queue);
		return queue;
	}
	return currentQueue;
}

export async function userQueueFn<T>(userID: string, fn: () => Promise<T>) {
	const queue = getUserUpdateQueue(userID);
	return queue.add(async () => {
		const error = new Error();
		try {
			return await fn();
		} catch (e) {
			console.error(e);
			error.message = (e as Error).message;
			throw error;
		}
	});
}
