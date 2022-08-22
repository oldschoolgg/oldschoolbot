import { userMention } from '@discordjs/builders';
import { User, xp_gains_skill_enum } from '@prisma/client';
import { Bank } from 'oldschooljs';

import { getUserGear, mahojiUserSettingsUpdate } from '../mahoji/mahojiSettings';
import { usernameCache } from './constants';
import { AddXpParams } from './minions/types';
import { SkillsEnum } from './skilling/types';
import { ItemBank } from './types';
import { getSkillsOfMahojiUser } from './util';
import { hasItemsEquippedOrInBank, minionName, userHasItemsEquippedAnywhere } from './util/minionUtils';

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

	get mention() {
		return userMention(this.id);
	}

	get usernameOrMention() {
		return usernameCache.get(this.id) ?? this.mention;
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

	public async addItemsToBank(
		this: User,
		{
			items,
			collectionLog = false,
			filterLoot = true,
			dontAddToTempCL = false
		}: { items: ItemBank | Bank; collectionLog?: boolean; filterLoot?: boolean; dontAddToTempCL?: boolean }
	) {
		return transactItems({
			collectionLog,
			itemsToAdd: new Bank(items),
			filterLoot,
			dontAddToTempCL,
			userID: this.id
		});
	}

	hasEquipped(args: Parameters<typeof userHasItemsEquippedAnywhere>['1']) {
		return userHasItemsEquippedAnywhere(this.user, args);
	}

	allItemsOwned() {
		const bank = new Bank();

		bank.add(this.bank);
		bank.add('Coins', Number(this.user.GP));
		if (this.user.minion_equippedPet) {
			bank.add(this.user.minion_equippedPet);
		}

		for (const setup of Object.values(this.gear)) {
			for (const equipped of Object.values(setup)) {
				if (equipped?.item) {
					bank.add(equipped.item, equipped.quantity);
				}
			}
		}

		return bank;
	}

	hasEquippedOrInBank(items: string | number | (string | number)[], type: 'every' | 'one' = 'one') {
		return hasItemsEquippedOrInBank(this.user, Array.isArray(items) ? items : [items], type);
	}

	get skillsAsXP() {
		return getSkillsOfMahojiUser(this.user, false);
	}
}
