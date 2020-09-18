import { KlasaUser } from 'klasa';

import { Roles, PerkTier, BitField } from '../constants';
import getSupportGuild from './getSupportGuild';
import { UserSettings } from '../settings/types/UserSettings';

export default function getUsersPerkTier(user: KlasaUser): PerkTier {
	if (user.client.owners.has(user)) {
		return 10;
	}

	if (
		user.settings.get(UserSettings.BitField).includes(BitField.IsPatronTier5) ||
		user.settings.get(UserSettings.Badges).includes(7)
	) {
		return PerkTier.Six;
	}

	if (
		user.settings.get(UserSettings.BitField).includes(BitField.IsPatronTier4) ||
		user.settings.get(UserSettings.Badges).includes(6)
	) {
		return PerkTier.Five;
	}

	const supportGuild = getSupportGuild(user.client);
	const member = supportGuild.members.get(user.id);
	if (
		user.settings.get(UserSettings.BitField).includes(BitField.IsPatronTier3) ||
		(member && [Roles.Contributor, Roles.Moderator].some(roleID => member.roles.has(roleID))) ||
		user.settings.get(UserSettings.Badges).includes(0) ||
		user.settings.get(UserSettings.Badges).includes(5)
	) {
		return PerkTier.Four;
	}

	if (
		user.settings.get(UserSettings.BitField).includes(BitField.IsPatronTier2) ||
		user.settings.get(UserSettings.Badges).includes(4)
	) {
		return PerkTier.Three;
	}

	if (
		user.settings.get(UserSettings.BitField).includes(BitField.IsPatronTier1) ||
		user.settings.get(UserSettings.Badges).includes(3)
	) {
		return PerkTier.Two;
	}

	if (
		(member && [Roles.Booster].some(roleID => member.roles.has(roleID))) ||
		user.settings.get(UserSettings.Badges).includes(1)
	) {
		return PerkTier.One;
	}

	return 0;
}
