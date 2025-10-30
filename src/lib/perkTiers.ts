import { Cache } from '@/lib/cache/redis.js';
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

export async function getUsersPerkTier(user: MUser): Promise<PerkTier | 0> {
	if ([BitField.isModerator].some(bit => user.bitfield.includes(bit))) {
		return PerkTier.Four;
	}

	const elligibleTiers = [];
	if (
		user.bitfield.includes(BitField.IsPatronTier1) ||
		user.bitfield.includes(BitField.HasPermanentTierOne) ||
		user.bitfield.includes(BitField.BothBotsMaxedFreeTierOnePerks)
	) {
		elligibleTiers.push(PerkTier.Two);
	} else {
		const member = await Cache.getMember(globalConfig.supportServerID, user.id);
		if (member && [Roles.Booster].some(roleID => member.roles.includes(roleID))) {
			elligibleTiers.push(PerkTier.One);
		}
	}

	const roboChimpCached = await Cache.getRoboChimpUser(user.id);
	if (roboChimpCached) {
		elligibleTiers.push(roboChimpCached.perk_tier);
	}

	const bitfield = user.bitfield;

	if (bitfield.includes(BitField.IsPatronTier6)) {
		elligibleTiers.push(PerkTier.Seven);
	}

	if (bitfield.includes(BitField.IsPatronTier5)) {
		elligibleTiers.push(PerkTier.Six);
	}

	if (bitfield.includes(BitField.IsPatronTier4)) {
		elligibleTiers.push(PerkTier.Five);
	}

	if (bitfield.includes(BitField.IsPatronTier3)) {
		elligibleTiers.push(PerkTier.Four);
	}

	if (bitfield.includes(BitField.IsPatronTier2)) {
		elligibleTiers.push(PerkTier.Three);
	}

	return Math.max(...elligibleTiers, 0);
}
