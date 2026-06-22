import { RedisKeys } from '@oldschoolgg/util';
import type { Redis } from 'ioredis';

export interface FetchUserQueueStats {
	queued: number;
	running: number;
	totalQueued: number;
	totalStarted: number;
	totalCompleted: number;
	totalFailed: number;
	totalFetchRequests: number;
	dedupeSkips: number;
	currentUserId: string | null;
	lastQueuedAt: Date | null;
	lastStartedAt: Date | null;
	lastCompletedAt: Date | null;
	lastFailedAt: Date | null;
	lastError: string | null;
	queuedUserIds: string[];
}

type FetchUserQueueStatsFields = Record<keyof FetchUserQueueStats, string>;

export const defaultUserQueueStats = (): FetchUserQueueStats => ({
	queued: 0,
	running: 0,
	totalQueued: 0,
	totalStarted: 0,
	totalCompleted: 0,
	totalFailed: 0,
	totalFetchRequests: 0,
	dedupeSkips: 0,
	currentUserId: null,
	lastQueuedAt: null,
	lastStartedAt: null,
	lastCompletedAt: null,
	lastFailedAt: null,
	lastError: null,
	queuedUserIds: []
});

function numberField(value: string | undefined): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function dateField(value: string | undefined): Date | null {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function redisFields(stats: FetchUserQueueStats): FetchUserQueueStatsFields {
	return {
		queued: stats.queued.toString(),
		running: stats.running.toString(),
		totalQueued: stats.totalQueued.toString(),
		totalStarted: stats.totalStarted.toString(),
		totalCompleted: stats.totalCompleted.toString(),
		totalFailed: stats.totalFailed.toString(),
		totalFetchRequests: stats.totalFetchRequests.toString(),
		dedupeSkips: stats.dedupeSkips.toString(),
		currentUserId: stats.currentUserId ?? '',
		lastQueuedAt: stats.lastQueuedAt?.toISOString() ?? '',
		lastStartedAt: stats.lastStartedAt?.toISOString() ?? '',
		lastCompletedAt: stats.lastCompletedAt?.toISOString() ?? '',
		lastFailedAt: stats.lastFailedAt?.toISOString() ?? '',
		lastError: stats.lastError ?? '',
		queuedUserIds: JSON.stringify(stats.queuedUserIds)
	};
}

export async function loadFetchQueueStats(redis: Redis): Promise<FetchUserQueueStats> {
	const fields = (await redis.hgetall(RedisKeys.Discord.UserFetchQueueStats)) as Partial<FetchUserQueueStatsFields>;
	return {
		...defaultUserQueueStats(),
		totalQueued: numberField(fields.totalQueued),
		totalStarted: numberField(fields.totalStarted),
		totalCompleted: numberField(fields.totalCompleted),
		totalFailed: numberField(fields.totalFailed),
		totalFetchRequests: numberField(fields.totalFetchRequests),
		dedupeSkips: numberField(fields.dedupeSkips),
		lastQueuedAt: dateField(fields.lastQueuedAt),
		lastStartedAt: dateField(fields.lastStartedAt),
		lastCompletedAt: dateField(fields.lastCompletedAt),
		lastFailedAt: dateField(fields.lastFailedAt),
		lastError: fields.lastError || null
	};
}

export async function updateFetchQueue(
	redis: Redis,
	stats: FetchUserQueueStats,
	updates: Partial<FetchUserQueueStats>
): Promise<void> {
	for (const [key, value] of Object.entries(updates)) {
		if (value !== undefined) {
			stats[key as keyof FetchUserQueueStats] = value as never;
		}
	}
	await redis.hset(RedisKeys.Discord.UserFetchQueueStats, redisFields(stats));
}
