import { KlasaUser } from 'klasa';

import { BitField, PerkTier, Roles } from '../constants';
import getSupportGuild from './getSupportGuild';
import { UserSettings } from '../settings/types/UserSettings';

export default function getUsersPerkTier(user: KlasaUser): PerkTier {
	if (user.client.owners.has(user)) {
		return 10;
	}

	const supportGuild = getSupportGuild(user.client);
	const member = supportGuild.members.find(member => member.user === user);

	if (user.settings.get(UserSettings.BitField).includes(BitField.IsPatronTier5)) {
		return PerkTier.Six;
	}

	if (user.settings.get(UserSettings.BitField).includes(BitField.IsPatronTier4)) {
		return PerkTier.Five;
	}

	if (
		user.settings.get(UserSettings.BitField).includes(BitField.IsPatronTier3) ||
		(member && [Roles.Contributor, Roles.Moderator].some(roleID => member.roles.has(roleID)))
	) {
		return PerkTier.Four;
	}

	if (user.settings.get(UserSettings.BitField).includes(BitField.IsPatronTier2)) {
		return PerkTier.Three;
	}

	if (user.settings.get(UserSettings.BitField).includes(BitField.IsPatronTier1)) {
		return PerkTier.Two;
	}

	if (member && [Roles.Booster].some(roleID => member.roles.has(roleID))) {
		return PerkTier.One;
	}

	return 0;
}
