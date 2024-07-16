import { SupportServer } from '../config';
import { BitField, PerkTier, Roles } from './constants';
import { getPerkTierSync } from './perkTier';

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

export function getUsersPerkTier(user: MUser): PerkTier | 0 {
	if (
		[BitField.isContributor, BitField.isModerator, BitField.IsWikiContributor].some(bit =>
			user.bitfield.includes(bit)
		)
	) {
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
		const guild = globalClient.guilds.cache.get(SupportServer);
		const member = guild?.members.cache.get(user.id);
		if (member && [Roles.Booster].some(roleID => member.roles.cache.has(roleID))) {
			elligibleTiers.push(PerkTier.One);
		}
	}

	const cached = getPerkTierSync(user.id);
	if (cached > 0) {
		elligibleTiers.push(cached);
	}

	const bitfield = user.bitfield;

	if (bitfield.includes(BitField.IsPatronTier6)) {
		return elligibleTiers.push(PerkTier.Seven);
	}

	if (bitfield.includes(BitField.IsPatronTier5)) {
		return elligibleTiers.push(PerkTier.Six);
	}

	if (bitfield.includes(BitField.IsPatronTier4)) {
		return elligibleTiers.push(PerkTier.Five);
	}

	if (bitfield.includes(BitField.IsPatronTier3)) {
		return elligibleTiers.push(PerkTier.Four);
	}

	if (bitfield.includes(BitField.IsPatronTier2)) {
		return elligibleTiers.push(PerkTier.Three);
	}

	return Math.max(...elligibleTiers, 0);
}
