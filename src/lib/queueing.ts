import PQueue from 'p-queue';

/**
 * Map<user_id, PromiseQueue>
 */
export const userQueues: Map<string, PQueue> = new Map();
