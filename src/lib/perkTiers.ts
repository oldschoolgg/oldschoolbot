import { getPerkTierEx, PerkTier, Time } from '@oldschoolgg/toolkit';
import { LRUCache } from 'lru-cache';

import { BitField, BOT_TYPE } from '@/lib/constants.js';

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
	return perkTierHotCache.get(userId)?.tier ?? null;
}

function getCourtesyTier(user: MUser): PerkTier {
	const tiers: PerkTier[] = [];
	if (user.isContributor || user.isModOrAdmin || user.isWikiContrib) {
		tiers.push(PerkTier.Four);
	} else if (user.isTrusted) {
		tiers.push(PerkTier.Three);
	}
	if (user.bitfield.includes(BitField.HasPermanentTierOne)) {
		tiers.push(BOT_TYPE === 'BSO' ? PerkTier.Three : PerkTier.Two);
	}
	if (user.bitfield.includes(BitField.BothBotsMaxedFreeTierOnePerks)) {
		tiers.push(PerkTier.Two);
	}
	return Math.max(...tiers, PerkTier.Zero) as PerkTier;
}

function getLegacyTier(user: MUser): PerkTier {
	const bitfield = user.bitfield;
	if (bitfield.includes(BitField.PatronTier6)) return PerkTier.Seven;
	if (bitfield.includes(BitField.PatronTier5)) return PerkTier.Six;
	if (bitfield.includes(BitField.PatronTier4)) return PerkTier.Five;
	if (bitfield.includes(BitField.PatronTier3)) return PerkTier.Four;
	if (bitfield.includes(BitField.PatronTier2)) return PerkTier.Three;
	if (bitfield.includes(BitField.PatronTier1)) return PerkTier.Two;
	return PerkTier.Zero;
}

export async function getUsersPerkTier({
	user,
	forceNoCache
}: {
	user: MUser;
	forceNoCache?: boolean;
}): Promise<PerkTier> {
	const hotTierBeforeRefresh = forceNoCache ? getPerkTierCached(user.id) : null;
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

	const roboChimpCached = await Cache.getRoboChimpUser(user.id, forceNoCache);
	const options = { courtesyTier: getCourtesyTier(user), legacyTier: getLegacyTier(user) };
	const sharedTier = roboChimpCached
		? getPerkTierEx(
				{
					patreonBits: roboChimpCached.bits,
					premiumTier: roboChimpCached.premium_balance_tier,
					premiumIsCyr: roboChimpCached.premium_balance_is_cyr,
					premiumExpiry: roboChimpCached.premium_balance_expiry_date
				},
				options
			)
		: getPerkTierEx({ patreonBits: [] }, options);
	const tier = Math.max(sharedTier, roboChimpCached?.perk_tier ?? PerkTier.Zero);

	setHotCache(user.id, tier);
	if (forceNoCache) {
		if (hotTierBeforeRefresh === tier) return tier as PerkTier;

		const redisTier = await Cache.getPerkTier(user.id);
		if (redisTier !== tier) {
			await Cache.setPerkTier(user.id, tier);
		}
		return tier as PerkTier;
	}
	await Cache.setPerkTier(user.id, tier);
	return tier as PerkTier;
}
