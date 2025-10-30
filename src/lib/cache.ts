import { type PerkTier, Time } from '@oldschoolgg/toolkit';
import { TimerManager } from '@sapphire/timer-manager';
import type { APIChannel, APIGuildMember, APIRole } from 'discord-api-types/v10';
import { LRUCache } from 'lru-cache';

import type { Giveaway, Guild } from '@/prisma/main.js';

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

export const partyLockCache: Set<string> = new Set();
TimerManager.setInterval(() => partyLockCache.clear(), Time.Minute * 20);

export const DISABLED_COMMANDS: Set<string> = new Set();
export const CACHED_ACTIVE_USER_IDS: Set<string> = new Set();
export const CHAT_PET_COOLDOWN_CACHE = new LRUCache<string, number>({ max: 2000 });

export const Cache = {
	MAIN_SERVER: {
		ROLES: new Map<string, APIRole>(),
		CHANNELS: new Map<string, APIChannel>(),
		MEMBERS: new Map<string, APIGuildMember>()
	}
};
