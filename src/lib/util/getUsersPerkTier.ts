import { User } from 'discord.js';
import { KlasaUser } from 'klasa';

import { BitField, PerkTier, Roles } from '../constants';
import { UserSettings } from '../settings/types/UserSettings';
import { getSupportGuild } from '../util';

const tier3ElligibleBits = [BitField.IsPatronTier3, BitField.isContributor, BitField.isModerator];

export default function getUsersPerkTier(userOrBitfield: KlasaUser | readonly BitField[]): PerkTier | 0 {
	if (userOrBitfield instanceof KlasaUser) {
		const main = userOrBitfield.settings.get(UserSettings.MainAccount);
		if (main) {
			const mainAccount = userOrBitfield.client.users.cache.get(main);
			if (mainAccount) {
				return getUsersPerkTier(mainAccount);
			}
		}
	}

	if (userOrBitfield instanceof User && userOrBitfield.client.owners.has(userOrBitfield)) {
		return 10;
	}

	const bitfield =
		userOrBitfield instanceof User ? userOrBitfield.settings.get(UserSettings.BitField) : userOrBitfield;

	if (bitfield.includes(BitField.IsPatronTier5)) {
		return PerkTier.Six;
	}

	if (bitfield.includes(BitField.IsPatronTier4)) {
		return PerkTier.Five;
	}

	if (tier3ElligibleBits.some(bit => bitfield.includes(bit))) {
		return PerkTier.Four;
	}

	if (bitfield.includes(BitField.IsPatronTier2)) {
		return PerkTier.Three;
	}

	if (bitfield.includes(BitField.IsPatronTier1)) {
		return PerkTier.Two;
	}

	if (bitfield.includes(BitField.HasPermanentTierOne)) {
		return PerkTier.Two;
	}

	if (userOrBitfield instanceof User) {
		const supportGuild = getSupportGuild(userOrBitfield.client);
		const member = supportGuild.members.cache.get(userOrBitfield.id);
		if (member && [Roles.Booster].some(roleID => member.roles.cache.has(roleID))) {
			return PerkTier.One;
		}
	}

	return 0;
}
