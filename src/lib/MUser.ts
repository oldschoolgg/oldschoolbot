import { userMention } from '@discordjs/builders';
import { User, xp_gains_skill_enum } from '@prisma/client';
import { Bank } from 'oldschooljs';

import { getUserGear, mahojiUserSettingsUpdate } from '../mahoji/mahojiSettings';
import { usernameCache } from './constants';
import { AddXpParams } from './minions/types';
import { SkillsEnum } from './skilling/types';
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

	get QP() {
		return this.user.QP;
	}

	async addXP(params: AddXpParams) {
		const user = await globalClient.fetchUser(this.id);
		return user.addXP(params);
	}

	getKC(monsterID: number) {
		return (this.user.monsterScores as ItemBank)[monsterID] ?? 0;
	}

	getAttackStyles() {
		const styles = this.user.attack_style;
		if (styles.length === 0) {
			return [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence];
		}
		return styles;
	}

	async incrementKC(monsterID: number, amountToAdd: number) {
		const newKCs = new Bank().add(this.user.monsterScores as ItemBank).add(monsterID, amountToAdd);
		const { newUser } = await mahojiUserSettingsUpdate(this.id, {
			monsterScores: newKCs.bank
		});

		this.user = newUser;

		return this;
	}
}
