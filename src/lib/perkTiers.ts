import { Time } from '@oldschoolgg/toolkit';
import { LRUCache } from 'lru-cache';

import { BitField, BOT_TYPE, PerkTier } from '@/lib/constants.js';
import type { RobochimpUser } from '@/lib/roboChimp.js';

export const RobochimpBitfieldEnum = {
	MagnaTier1: 8,
	MagnaTier2: 9,
	MagnaTier3: 10,
	MagnaTier4: 11,
	MagnaTier5: 12,
	MagnaTier6: 13,
	CyrTier0: 16,
	CyrTier1: 17,
	CyrTier2: 18,
	CyrTier3: 19,
	CyrTier4: 20,
	CyrTier5: 21,
	CyrTier6: 22,
	CyrTier7: 23,
	CyrsOriginalPatrons: 24,
	BonusMinute: 25
};

const CYR_TIER_BITS = [
	{ bit: RobochimpBitfieldEnum.CyrTier7, number: 7 },
	{ bit: RobochimpBitfieldEnum.CyrTier6, number: 6 },
	{ bit: RobochimpBitfieldEnum.CyrTier5, number: 5 },
	{ bit: RobochimpBitfieldEnum.CyrTier4, number: 4 },
	{ bit: RobochimpBitfieldEnum.CyrTier3, number: 3 },
	{ bit: RobochimpBitfieldEnum.CyrTier2, number: 2 },
	{ bit: RobochimpBitfieldEnum.CyrTier1, number: 1 },
	{ bit: RobochimpBitfieldEnum.CyrTier0, number: 0 }
] as const;

const MAGNA_TIER_BITS = [
	{ bit: RobochimpBitfieldEnum.MagnaTier6, number: 6 },
	{ bit: RobochimpBitfieldEnum.MagnaTier5, number: 5 },
	{ bit: RobochimpBitfieldEnum.MagnaTier4, number: 4 },
	{ bit: RobochimpBitfieldEnum.MagnaTier3, number: 3 },
	{ bit: RobochimpBitfieldEnum.MagnaTier2, number: 2 },
	{ bit: RobochimpBitfieldEnum.MagnaTier1, number: 1 }
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

export function getRoboChimpPaidTierDisplay(bits: number[], { perkTier }: { perkTier?: number | null }): string;
export function getRoboChimpPaidTierDisplay(user: RobochimpUser, { perkTier }: { perkTier?: number | null }): string;
export function getRoboChimpPaidTierDisplay(
	bitsOrUser: number[] | RobochimpUser | null | undefined,
	{
		perkTier
	}: {
		perkTier?: number | null;
	}
) {
	const bits = bitsOrUser && 'bits' in bitsOrUser ? bitsOrUser.bits : bitsOrUser;
	if (!bits || bits.length === 0) {
		return perkTier && perkTier > 0 ? `Perk Tier ${perkTier}` : 'None';
	}

	const labels = [
		...CYR_TIER_BITS.filter(tier => bits.includes(tier.bit)).map(tier => `Cyr Tier ${tier.number}`),
		...MAGNA_TIER_BITS.filter(tier => bits.includes(tier.bit)).map(tier => `Magna Tier ${tier.number}`)
	];

	if (bits.includes(RobochimpBitfieldEnum.BonusMinute)) {
		labels.push('*Bonus Minute??*');
	}

	return labels.length === 0 ? (perkTier && perkTier > 0 ? `Perk Tier ${perkTier}` : 'None') : labels.join(', ');
}

export function getCyrTripBonus(user: RobochimpUser): number;
export function getCyrTripBonus(bits: number[]): number;
export function getCyrTripBonus(bitsOrUser: number[] | RobochimpUser | null | undefined) {
	const bits = bitsOrUser && 'bits' in bitsOrUser ? bitsOrUser.bits : bitsOrUser;
	if (!bits || bits.length === 0) {
		return 0;
	}
	let cyrBonus = 0;
	const highestTier = CYR_TIER_BITS.find(tier => bits.includes(tier.bit))?.number;
	switch (highestTier) {
		case 1:
			cyrBonus = Time.Minute * 7;
			break;
		case 2:
			cyrBonus = Time.Minute * 11;
			break;
		case 3:
		default:
			// Default of 3 minutes
			cyrBonus = Time.Minute * 3;
			if (highestTier && highestTier >= 3) {
				cyrBonus = Time.Minute * 16;
			}
			break;
	}
	if (bits.includes(RobochimpBitfieldEnum.CyrsOriginalPatrons)) {
		cyrBonus += Time.Minute * 2;
	}
	if (bits.includes(RobochimpBitfieldEnum.BonusMinute)) {
		cyrBonus += Time.Minute * 3;
	}
	return cyrBonus;
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
		const redisCacheEntry = await Cache.getPerkTier(user.id);
		if (redisCacheEntry) {
			setHotCache(user.id, redisCacheEntry);
			return redisCacheEntry;
		}
	}

	const eligibleTiers = [];
	if (user.isContributor() || user.isModOrAdmin() || user.isWikiContrib()) {
		eligibleTiers.push(PerkTier.Four);
	} else if (user.isTrusted()) {
		eligibleTiers.push(PerkTier.Three);
	}

	const bitfield = user.bitfield;

	// TODO: Remove these tiers:
	// Courtesy tiers.
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
	// END TODO

	const roboChimpCached = await Cache.getRoboChimpUser(user.id);
	if (roboChimpCached) {
		eligibleTiers.push(roboChimpCached.perk_tier);
		if (
			roboChimpCached.premium_balance_tier &&
			roboChimpCached.premium_balance_expiry_date &&
			Number(roboChimpCached.premium_balance_expiry_date) > Date.now()
		) {
			eligibleTiers.push(roboChimpCached.premium_balance_tier);
		}
	}

	if (bitfield.includes(BitField.HasPermanentTierOne)) {
		if (BOT_TYPE === 'BSO') {
			eligibleTiers.push(PerkTier.Three);
		} else {
			eligibleTiers.push(PerkTier.Two);
		}
	}
	if (bitfield.includes(BitField.PatronTier1) || bitfield.includes(BitField.BothBotsMaxedFreeTierOnePerks)) {
		eligibleTiers.push(PerkTier.Two);
	}
	// Server boosting perk has been eliminated
	const tier = Math.max(...eligibleTiers, 0);
	setHotCache(user.id, tier);
	await Cache.setPerkTier(user.id, tier);
	return tier;
}
