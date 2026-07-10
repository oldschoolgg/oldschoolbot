import { BitField, PerkTier } from '@/lib/constants.js';
import '@/lib/cache/redis.js';

import { roboChimpUserFetchCached } from '@/lib/roboChimp.js';

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

export async function getUsersPerkTier({
	user,
	forceNoCache
}: {
	user: MUser;
	forceNoCache?: boolean;
}): Promise<PerkTier | 0> {
	if (!forceNoCache) {
		const cachedTier = await Cache.getPerkTier(user.id);
		if (cachedTier !== null) return cachedTier as PerkTier | 0;
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

	const roboChimpUser = await roboChimpUserFetchCached(user.id);
	eligibleTiers.push(roboChimpUser.perk_tier);

	// Why bother looking for the member if it doesn't help get a higher tier
	if (
		user.bitfield.includes(BitField.PatronTier1) ||
		user.bitfield.includes(BitField.HasPermanentTierOne) ||
		user.bitfield.includes(BitField.BothBotsMaxedFreeTierOnePerks)
	) {
		// Note: BSO Get's PerkTier.Three, but we handle that in MUser now
		// TODO: Remove this in the future
		// if (BOT_TYPE === 'BSO' && user.bitfield.includes(BitField.HasPermanentTierOne)) {
		eligibleTiers.push(PerkTier.Two);
	}

	// Server boosting perk has been eliminated
	const tier = Math.max(...eligibleTiers, 0);
	// If tier is higher than what Robochimp thinks, update robochimp
	if (tier > roboChimpUser.perk_tier) {
		const updatedUser = await roboChimpClient.user.upsert({
			where: {
				id: BigInt(user.id)
			},
			update: { perk_tier: tier },
			create: { id: BigInt(user.id), perk_tier: tier }
		});
		await Cache.setRoboChimpUser(user.id, updatedUser);
	}
	await Cache.setPerkTier(user.id, tier);
	return tier;
}
