import { type PerkTier, Time } from '@oldschoolgg/toolkit';
import type { Giveaway, Guild } from '@prisma/client';
import { TimerManager } from '@sapphire/timer-manager';
import { LRUCache } from 'lru-cache';

export const perkTierCache = new Map<string, 0 | PerkTier>();

type CachedGuild = Pick<Guild, 'disabledCommands' | 'id' | 'petchannel' | 'staffOnlyChannels'>;
export const untrustedGuildSettingsCache = new LRUCache<string, CachedGuild>({ max: 1000 });

export const giveawayCache = new LRUCache<number, Giveaway>({
	max: 10,
	ttl: Time.Second * 10,
	ttlAutopurge: true,
	ttlResolution: Time.Second
});

export const usernameWithBadgesCache = new Map<string, string>();
export const lastRoboChimpSyncCache = new Map<string, number>();

export const partyLockCache = new Set<string>();
TimerManager.setInterval(() => partyLockCache.clear(), Time.Minute * 20);
