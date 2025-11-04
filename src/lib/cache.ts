import { Time } from '@oldschoolgg/toolkit';
import { TimerManager } from '@sapphire/timer-manager';
import { LRUCache } from 'lru-cache';

import type { Giveaway } from '@/prisma/main.js';

export const lastRoboChimpSyncCache = new Map<string, number>();

export const partyLockCache: Set<string> = new Set();
TimerManager.setInterval(() => partyLockCache.clear(), Time.Minute * 20);

export const MESSAGE_COLLECTORS_CACHE = new LRUCache<string, any>({ max: 1000, ttl: Time.Minute * 10 });

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

export const BLACKLISTED_USERS = new Set<string>();
export const BLACKLISTED_GUILDS = new Set<string>();
