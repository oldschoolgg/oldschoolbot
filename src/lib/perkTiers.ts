import type { MInteraction } from '@oldschoolgg/discord';
import { Time } from '@oldschoolgg/toolkit';
import { LRUCache } from 'lru-cache';

import { BitField, globalConfig, PerkTier, Roles } from '@/lib/constants.js';

export const allPerkBitfields: BitField[] = [
	BitField.IsPatronTier6,
	BitField.IsPatronTier5,
	BitField.IsPatronTier4,
	BitField.IsPatronTier3,
	BitField.IsPatronTier2,
	BitField.IsPatronTier1,
	BitField.HasPermanentTierOne,
	BitField.BothBotsMaxedFreeTierOnePerks
];

type PerkTierHotCacheEntry = {
	tier: number;
	expires: number;
};
const PerkTierHotTTL = Time.Hour * 2;

const perkTierHotCache = new LRUCache<string, PerkTierHotCacheEntry>({
	max: 10_000,
	ttl: Time.Minute * 60,
	updateAgeOnGet: true
});

function setHotCache(userId: string, tier: number) {
	perkTierHotCache.set(userId, { tier, expires: Date.now() + PerkTierHotTTL });
}
export function getPerkTierCached(userId: string) {
	const tierCacheEntry = perkTierHotCache.get(userId);
	if (tierCacheEntry) {
		return tierCacheEntry.tier;
	}
	return null;
}
export async function getUsersPerkTier({
	user,
	guildId,
	interaction,
	forceNoCache
}: {
	user: MUser;
	guildId?: string | null;
	interaction?: MInteraction;
	forceNoCache?: boolean;
}): Promise<PerkTier | 0> {
	if (!forceNoCache) {
		// We want a way to force a cache refresh
		// Otherwise, we look for the a cached tier:
		const tierCacheEntry = perkTierHotCache.get(user.id);
		// If it's not expired, return it:
		if (tierCacheEntry && tierCacheEntry.expires < Date.now()) {
			return tierCacheEntry.tier;
		}
	}
	const possibleGuildId = guildId ?? interaction?.guildId ?? null;
	const eligibleTiers = [];
	if (user.isMod()) {
		eligibleTiers.push(PerkTier.Four);
	}

	const bitfield = user.bitfield;

	if (bitfield.includes(BitField.IsPatronTier6)) {
		eligibleTiers.push(PerkTier.Seven);
	}

	if (bitfield.includes(BitField.IsPatronTier5)) {
		eligibleTiers.push(PerkTier.Six);
	}

	if (bitfield.includes(BitField.IsPatronTier4)) {
		eligibleTiers.push(PerkTier.Five);
	}

	if (bitfield.includes(BitField.IsPatronTier3)) {
		eligibleTiers.push(PerkTier.Four);
	}

	if (bitfield.includes(BitField.IsPatronTier2)) {
		eligibleTiers.push(PerkTier.Three);
	}

	const roboChimpCached = await Cache.getRoboChimpUser(user.id);
	if (roboChimpCached) {
		eligibleTiers.push(roboChimpCached.perk_tier);
	}
	if (Math.max(...eligibleTiers) < PerkTier.Two) {
		// Why bother looking for the member if it doesn't help get a higher tier
		if (
			user.bitfield.includes(BitField.IsPatronTier1) ||
			user.bitfield.includes(BitField.HasPermanentTierOne) ||
			user.bitfield.includes(BitField.BothBotsMaxedFreeTierOnePerks)
		) {
			eligibleTiers.push(PerkTier.Two);
		} else {
			// Only fetch guild member if we know they're in there.
			const isSupportServer = possibleGuildId === globalConfig.supportServerID;
			if (isSupportServer) {
				const member = await Cache.getMember({ guildId: globalConfig.supportServerID, userId: user.id });
				if (member && [Roles.Booster].some(roleID => member.roles.includes(roleID))) {
					eligibleTiers.push(PerkTier.One);
				}
			}
		}
	}
	const tier = Math.max(...eligibleTiers, 0);
	setHotCache(user.id, tier);
	return tier;
}
