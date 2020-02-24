import { KlasaUser } from 'klasa';

import { Roles, PerkTier } from '../constants';
import getSupportGuild from './getSupportGuild';

export default function getUsersPerkTier(user: KlasaUser): number {
	if (user.client.owners.has(user)) {
		return 10;
	}

	const supportGuild = getSupportGuild(user.client);
	const member = supportGuild.members.find(member => member.user === user);
	if (!member) return 0;

	if (member.roles.has(Roles.PatronTier2)) {
		return PerkTier.Three;
	}

	if (member.roles.has(Roles.PatronTier1)) {
		return PerkTier.Two;
	}

	if (
		[Roles.Booster, Roles.Contributor, Roles.Moderator].some(roleID => member.roles.has(roleID))
	) {
		return PerkTier.One;
	}

	return 0;
}
