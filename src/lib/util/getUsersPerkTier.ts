import { KlasaUser } from 'klasa';

import { Roles, PerkTier, BitField } from '../constants';
import getSupportGuild from './getSupportGuild';
import { UserSettings } from '../UserSettings';

export default function getUsersPerkTier(user: KlasaUser): number {
	if (user.client.owners.has(user)) {
		return 10;
	}

	if (user.settings.get(UserSettings.BitField).includes(BitField.IsPatronTier2)) {
		return PerkTier.Three;
	}

	if (user.settings.get(UserSettings.BitField).includes(BitField.IsPatronTier1)) {
		return PerkTier.Two;
	}

	const supportGuild = getSupportGuild(user.client);
	const member = supportGuild.members.find(member => member.user === user);
	if (!member) return 0;

	if (
		[Roles.Booster, Roles.Contributor, Roles.Moderator].some(roleID => member.roles.has(roleID))
	) {
		return PerkTier.One;
	}

	return 0;
}
