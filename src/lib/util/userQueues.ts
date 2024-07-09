import PromiseQueue from 'p-queue';

const userQueues: Map<string, PromiseQueue> = new Map();
function getUserUpdateQueue(userID: string) {
	const currentQueue = userQueues.get(userID);
	if (!currentQueue) {
		const queue = new PromiseQueue({ concurrency: 1 });
		userQueues.set(userID, queue);
		return queue;
	}
	return currentQueue;
}

export async function userQueueFn<T>(userID: string, fn: () => Promise<T>) {
	const queue = getUserUpdateQueue(userID);
	return new Promise<T>((resolve, reject) => {
		queue.add(async () => {
			try {
				const result = await fn();
				resolve(result);
			} catch (e) {
				console.error(e);
				reject(e);
			}
		});
	});
}
