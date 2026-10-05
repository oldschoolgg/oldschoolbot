import {
	getCyrTripBonus,
	getPerkTierDetails,
	getPerkTierEx,
	getPerkTierDisplay as getSharedPerkDisplay,
	type PerkTierEntitlement,
	RoboChimpBit,
	Time
} from '@oldschoolgg/toolkit';
import { LRUCache } from 'lru-cache';

import { BitField, PerkTier } from '@/lib/constants.js';
import type { RobochimpUser } from '@/lib/roboChimp.js';
export const RobochimpBitfieldEnum = {
	MagnaTier1: RoboChimpBit.MagnaTier1,
	MagnaTier2: RoboChimpBit.MagnaTier2,
	MagnaTier3: RoboChimpBit.MagnaTier3,
	MagnaTier4: RoboChimpBit.MagnaTier4,
	MagnaTier5: RoboChimpBit.MagnaTier5,
	MagnaTier6: RoboChimpBit.MagnaTier6,
	CyrTier0: RoboChimpBit.CyrTier0,
	CyrTier1: RoboChimpBit.CyrTier1,
	CyrTier2: RoboChimpBit.CyrTier2,
	CyrTier3: RoboChimpBit.CyrTier3,
	CyrTier4: RoboChimpBit.CyrTier4,
	CyrTier5: RoboChimpBit.CyrTier5,
	CyrTier6: RoboChimpBit.CyrTier6,
	CyrTier7: RoboChimpBit.CyrTier7,
	CyrsOriginalPatrons: RoboChimpBit.CyrsOriginalPatrons,
	BonusMinute: RoboChimpBit.BonusMinute
} as const;

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

export function setHotCache(userId: string, tier: number) {
	perkTierHotCache.set(userId, { tier, expires: Date.now() + PerkTierHotTTL });
}

export function getPerkTierCached(userId: string) {
	const tierCacheEntry = perkTierHotCache.get(userId);
	if (tierCacheEntry) {
		return tierCacheEntry.tier;
	}
	return null;
}

export { getCyrTripBonus };

export function getCourtesyTier(user: MUser): PerkTier {
	const tiers: number[] = [];
	if (user.isContributor() || user.isModOrAdmin() || user.isWikiContrib()) {
		tiers.push(PerkTier.Four);
	} else if (user.isTrusted()) {
		tiers.push(PerkTier.Three);
	}
	if (
		user.bitfield.includes(BitField.HasPermanentTierOne) ||
		user.bitfield.includes(BitField.BothBotsMaxedFreeTierOnePerks)
	) {
		tiers.push(PerkTier.Two);
	}
	return Math.max(...tiers, PerkTier.Zero) as PerkTier;
}

export function getLegacyTier(user: MUser): PerkTier {
	const bitfield = user.bitfield;
	if (bitfield.includes(BitField.PatronTier6)) return PerkTier.Seven;
	if (bitfield.includes(BitField.PatronTier5)) return PerkTier.Six;
	if (bitfield.includes(BitField.PatronTier4)) return PerkTier.Five;
	if (bitfield.includes(BitField.PatronTier3)) return PerkTier.Four;
	if (bitfield.includes(BitField.PatronTier2)) return PerkTier.Three;
	if (bitfield.includes(BitField.PatronTier1)) return PerkTier.Two;
	return PerkTier.Zero;
}

function userPerkInput(roboUser: RobochimpUser, patreonBits: number[] = roboUser.bits) {
	return {
		patreonBits,
		premiumTier: roboUser.premium_balance_tier,
		premiumExpiry: roboUser.premium_balance_expiry_date
	};
}

export function getMUserPerkDetails(
	user: MUser,
	roboUser: RobochimpUser,
	patreonBits?: number[]
): PerkTierEntitlement[] {
	return getPerkTierDetails(userPerkInput(roboUser, patreonBits), {
		courtesyTier: getCourtesyTier(user),
		legacyTier: getLegacyTier(user)
	});
}

export function getMUserPerkDisplay(user: MUser, roboUser: RobochimpUser, patreonBits?: number[]): string {
	return getSharedPerkDisplay(userPerkInput(roboUser, patreonBits), {
		courtesyTier: getCourtesyTier(user),
		legacyTier: getLegacyTier(user)
	});
}

export async function getUsersPerkTier({
	user,
	forceNoCache
}: {
	user: MUser;
	forceNoCache?: boolean;
}): Promise<PerkTier> {
	if (!forceNoCache) {
		const tierCacheEntry = perkTierHotCache.get(user.id);
		if (tierCacheEntry && tierCacheEntry.expires > Date.now()) {
			return tierCacheEntry.tier as PerkTier;
		}
		const redisCacheEntry = await Cache.getPerkTier(user.id);
		if (redisCacheEntry) {
			setHotCache(user.id, redisCacheEntry);
			return redisCacheEntry as PerkTier;
		}
	}

	const options = { courtesyTier: getCourtesyTier(user), legacyTier: getLegacyTier(user) };
	const roboChimpCached = await Cache.getRoboChimpUser(user.id);
	const sharedTier = roboChimpCached
		? getPerkTierEx(
				{
					patreonBits: roboChimpCached.bits,
					premiumTier: roboChimpCached.premium_balance_tier,
					premiumExpiry: roboChimpCached.premium_balance_expiry_date
				},
				options
			)
		: getPerkTierEx({ patreonBits: [] }, options);
	const tier = Math.max(sharedTier, roboChimpCached?.perk_tier ?? PerkTier.Zero);

	setHotCache(user.id, tier);
	await Cache.setPerkTier(user.id, tier);
	return tier as PerkTier;
}
