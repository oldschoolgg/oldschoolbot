import { Time } from '@oldschoolgg/toolkit';
import { LRUCache } from 'lru-cache';

import { BitField, PerkTier } from '@/lib/constants.js';

const CYR_TIER_BITS = [
	{ bit: 23, number: 7 },
	{ bit: 22, number: 6 },
	{ bit: 21, number: 5 },
	{ bit: 20, number: 4 },
	{ bit: 19, number: 3 },
	{ bit: 18, number: 2 },
	{ bit: 17, number: 1 },
	{ bit: 16, number: 0 }
] as const;

const MAGNA_TIER_BITS = [
	{ bit: 13, number: 6 },
	{ bit: 12, number: 5 },
	{ bit: 11, number: 4 },
	{ bit: 10, number: 3 },
	{ bit: 9, number: 2 },
	{ bit: 8, number: 1 }
] as const;

const ROBOCHIMP_PAID_BITS = new Set([...CYR_TIER_BITS, ...MAGNA_TIER_BITS].map(tier => tier.bit));

export const allPerkBitfields: BitField[] = [BitField.HasPermanentTierOne, BitField.BothBotsMaxedFreeTierOnePerks];

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

export function getRoboChimpPaidTierDisplay({
	bits,
	perkTier
}: {
	bits: readonly number[] | null | undefined;
	perkTier?: number | null;
}) {
	if (!bits || bits.length === 0) {
		return perkTier && perkTier > 0 ? `Perk Tier ${perkTier}` : 'None';
	}

	const labels = [
		...CYR_TIER_BITS.filter(tier => bits.includes(tier.bit)).map(tier => `Cyr Tier ${tier.number}`),
		...MAGNA_TIER_BITS.filter(tier => bits.includes(tier.bit)).map(tier => `Magna Tier ${tier.number}`)
	];

	return labels.length === 0 ? (perkTier && perkTier > 0 ? `Perk Tier ${perkTier}` : 'None') : labels.join(', ');
}

export function getCyrTripBonus(bits: readonly number[] | null | undefined) {
	if (!bits || bits.length === 0) return 0;
	const highestTier = CYR_TIER_BITS.find(tier => bits.includes(tier.bit))?.number;
	if (highestTier === undefined) return 0;
	if (highestTier >= 3) return Time.Minute * 15;
	if (highestTier === 2) return Time.Minute * 10;
	if (highestTier === 1) return Time.Minute * 6;
	return Time.Minute * 3;
}

export async function getRoboChimpGroupPaidBits(userID: string) {
	const roboChimpCached = await Cache.getRoboChimpUser(userID);
	if (!roboChimpCached) return [];
	if (!roboChimpCached.user_group_id) {
		return roboChimpCached.bits.filter(bit => ROBOCHIMP_PAID_BITS.has(bit));
	}

	const groupUsers = await roboChimpClient.user.findMany({
		where: {
			user_group_id: roboChimpCached.user_group_id
		},
		select: {
			bits: true
		}
	});

	return [...new Set(groupUsers.flatMap(groupUser => groupUser.bits.filter(bit => ROBOCHIMP_PAID_BITS.has(bit))))];
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
	setHotCache(user.id, tier);
	return tier;
}
