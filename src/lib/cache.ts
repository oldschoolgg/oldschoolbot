import { Time } from '@oldschoolgg/toolkit';
import { TimerManager } from '@sapphire/timer-manager';
import { LRUCache } from 'lru-cache';
import type PromiseQueue from 'p-queue';
import PQueue from 'p-queue';

import type { Giveaway } from '@/prisma/main.js';
import type { CanvasImage } from '@/lib/canvas/canvasUtil.js';
import { BOT_TYPE, globalConfig } from '@/lib/constants.js';
import type { MarketPriceData } from '@/lib/marketPrices.js';

export const lastRoboChimpSyncCache = new Map<string, number>();

export const partyLockCache: Set<string> = new Set();
if (globalConfig.isProduction) {
	TimerManager.setInterval(() => partyLockCache.clear(), Time.Minute * 20);
}

export const CHAT_PET_COOLDOWN_CACHE = new LRUCache<string, number>({ max: 2000 });
export const giveawayCache = new LRUCache<number, Giveaway>({
	max: 10,
	ttl: Time.Second * 10,
	ttlAutopurge: true,
	ttlResolution: Time.Second
});
export const GE_SLOTS_CACHE = new LRUCache<
	string,
	{
		slots: number;
		doesntHaveNames: string[];
		possibleExtra: number;
		maxPossible: number;
	}
>({
	ttl: Time.Hour,
	max: 300
});
export const RARE_ROLES_CACHE = new LRUCache<string, number>({ max: 1000 });

export const userQueues: Map<string, PromiseQueue> = new Map();
export const CUSTOM_PRICE_CACHE = new Map<number, number>();
export const marketPricemap = new Map<number, MarketPriceData>();

const busyUsers = new Set<string>();

export function modifyUserBusy({
	reason,
	userID,
	type
}: {
	type: 'lock' | 'unlock';
	userID: string;
	reason: string;
}): void {
	const isBusy = busyUsers.has(userID);

	switch (type) {
		case 'lock': {
			if (isBusy) {
				Logging.logDebug(`Tried to busy-lock an already busy user. UserID[${userID}] Reason[${reason}]`);
				return;
			} else {
				busyUsers.add(userID);
			}
			break;
		}
		case 'unlock': {
			if (!isBusy) {
				Logging.logDebug(`Tried to unlock an already unlocked user. UserID[${userID}] Reason[${reason}]`);
				return;
			} else {
				busyUsers.delete(userID);
			}
			break;
		}
	}
}

export function userIsBusy(userID: string): boolean {
	return busyUsers.has(userID);
}

export async function populateUsernameCache() {
	if (BOT_TYPE === 'OSB') return;
	const users = await prisma.user.findMany({
		where: {
			username_with_badges: {
				not: null
			}
		},
		select: {
			id: true,
			username_with_badges: true
		}
	});
	console.log(`Populating username cache with ${users.length}x... (this should be removed soon`);

	const queue = new PQueue({ concurrency: 10 });
	for (const user of users) {
		if (!user.username_with_badges) return;
		queue.add(async () => Cache.setBadgedUsername(user.id, user.username_with_badges!));
	}
}
export const itemEffectImageCache = new LRUCache<string, CanvasImage>({ max: 1000 });
