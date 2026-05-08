import { Time } from '@oldschoolgg/toolkit';
import { LRUCache } from 'lru-cache';

import { BitField, PerkTier } from '@/lib/constants.js';

export const allPerkBitfields: BitField[] = [
	BitField.PatronTier6,
	BitField.PatronTier5,
	BitField.PatronTier4,
	BitField.PatronTier3,
	BitField.PatronTier2,
	BitField.PatronTier1,
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
	updateAgeOnGet: false
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
	forceNoCache
}: {
	user: MUser;
	forceNoCache?: boolean;
}): Promise<PerkTier | 0> {
	if (!forceNoCache) {
		// We want a way to force a cache refresh
		// Otherwise, we look for a cached tier:
		const tierCacheEntry = perkTierHotCache.get(user.id);
		// If it's not expired, return it:
		if (tierCacheEntry && tierCacheEntry.expires > Date.now()) {
			return tierCacheEntry.tier;
		}
	}

	const eligibleTiers = [];
	if (user.isContributor() || user.isModOrAdmin()) {
		eligibleTiers.push(PerkTier.Four);
	} else if (user.isTrusted()) {
		eligibleTiers.push(PerkTier.Three);
	}

	const bitfield = user.bitfield;

	if (bitfield.includes(BitField.PatronTier6)) {
		eligibleTiers.push(PerkTier.Seven);
	}

	if (bitfield.includes(BitField.PatronTier5)) {
		eligibleTiers.push(PerkTier.Six);
	}

	if (bitfield.includes(BitField.PatronTier4)) {
		eligibleTiers.push(PerkTier.Five);
	}

	if (bitfield.includes(BitField.PatronTier3)) {
		eligibleTiers.push(PerkTier.Four);
	}

	if (bitfield.includes(BitField.PatronTier2)) {
		eligibleTiers.push(PerkTier.Three);
	}

	const roboChimpCached = await Cache.getRoboChimpUser(user.id);
	if (roboChimpCached) {
		eligibleTiers.push(roboChimpCached.perk_tier);
	}

	// Why bother looking for the member if it doesn't help get a higher tier
	if (
		user.bitfield.includes(BitField.PatronTier1) ||
		user.bitfield.includes(BitField.HasPermanentTierOne) ||
		user.bitfield.includes(BitField.BothBotsMaxedFreeTierOnePerks)
	) {
		eligibleTiers.push(PerkTier.Two);
	}
	// Server boosting perk has been eliminated

	const tier = Math.max(...eligibleTiers, 0);
	// If tier is higher than what robochimp thinks, smack that fool.
	if (tier > (roboChimpCached?.perk_tier ?? 0)) {
		await roboChimpClient.user.upsert({
			where: {
				id: BigInt(user.id)
			},
			update: { perk_tier: tier },
			create: { id: BigInt(user.id) }
		});
	}
	setHotCache(user.id, tier);
	return tier;
}
