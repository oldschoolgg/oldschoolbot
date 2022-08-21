import { userMention } from '@discordjs/builders';
import { User, xp_gains_skill_enum } from '@prisma/client';
import { Bank } from 'oldschooljs';

import { getUserGear } from '../mahoji/mahojiSettings';
import { usernameCache } from './constants';
import { AddXpParams } from './minions/types';
import { ItemBank } from './types';
import { getSkillsOfMahojiUser } from './util';
import { minionName } from './util/minionUtils';

export class MUser {
	user: User;
	id: string;

	constructor(user: User) {
		this.user = user;
		this.id = user.id;
	}

	skillLevel(skill: xp_gains_skill_enum) {
		const skills = getSkillsOfMahojiUser(this.user, true);
		return skills[skill];
	}

	get gear() {
		return getUserGear(this.user);
	}

	get bank() {
		return new Bank(this.user.bank as ItemBank);
	}

	get cl() {
		return new Bank(this.user.collectionLogBank as ItemBank);
	}

	get minionName() {
		return minionName(this.user);
	}

	get usernameOrMention() {
		return usernameCache.get(this.id) ?? userMention(this.id);
	}

	async addXP(params: AddXpParams) {
		const user = await globalClient.fetchUser(this.id);
		return user.addXP(params);
	}
}
