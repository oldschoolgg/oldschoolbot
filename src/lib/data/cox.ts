import { KlasaUser } from 'klasa';
import { ChambersOfXericOptions } from 'oldschooljs/dist/simulation/minigames/ChambersOfXeric';

import { Skills } from '../types';
import { skillsMeetRequirements } from '../util';

export const bareMinStats: Skills = {
	attack: 80,
	strength: 80,
	defence: 80,
	ranged: 80,
	magic: 80,
	prayer: 70
};

export const bareMinSoloStats: Skills = {
	...bareMinStats,
	farming: 55,
	herblore: 78
};

export function hasMinRaidsRequirements(user: KlasaUser, solo: boolean) {
	return skillsMeetRequirements(user.rawSkills, solo ? bareMinSoloStats : bareMinStats);
}

export function createTeam(users: KlasaUser[]): ChambersOfXericOptions['team'] {
	return users.map(u => ({
		id: u.id,
		personalPoints: 1000,
		canReceiveAncientTablet: true,
		canReceiveDust: true
	}));
}
