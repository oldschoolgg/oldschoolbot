import { KlasaUser } from 'klasa';

import { BitField, PerkTier, Roles } from '../constants';
import { UserSettings } from '../settings/types/UserSettings';
import getSupportGuild from './getSupportGuild';

const tier3ElligibleBits = [BitField.IsPatronTier3, BitField.isContributor, BitField.isModerator];

export default function getUsersPerkTier(user: KlasaUser): PerkTier {
	if (user.client.owners.has(user)) {
		return PerkTier.Six;
	}

	const bitfield = user.settings.get(UserSettings.BitField);

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

	const supportGuild = getSupportGuild(user.client);
	const member = supportGuild.members.get(user.id);
	if (member && [Roles.Booster].some(roleID => member.roles.has(roleID))) {
		return PerkTier.One;
	}

	return 0;
}
