import { userMention } from '@discordjs/builders';
import { User, xp_gains_skill_enum } from '@prisma/client';
import { Bank } from 'oldschooljs';

import { getUserGear, mahojiUserSettingsUpdate } from '../mahoji/mahojiSettings';
import { BitField, usernameCache } from './constants';
import { allPetIDs } from './data/CollectionsExport';
import { AddXpParams } from './minions/types';
import { SkillsEnum } from './skilling/types';
import { ItemBank } from './types';
import { addItemToBank, getSkillsOfMahojiUser } from './util';
import getUsersPerkTier from './util/getUsersPerkTier';
import { minionIsBusy } from './util/minionIsBusy';
import { hasItemsEquippedOrInBank, minionName } from './util/minionUtils';
import resolveItems from './util/resolveItems';

export class MUser {
	user: Readonly<User>;
	id: string;

	constructor(user: User) {
		this.user = user;
		this.id = user.id;
	}

	get GP() {
		return Number(this.user.GP);
	}

	get bitfield() {
		return this.user.bitfield as BitField[];
	}

	get perkTier() {
		return getUsersPerkTier(this.user);
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

	public async addItemsToBank({
		items,
		collectionLog = false,
		filterLoot = true,
		dontAddToTempCL = false
	}: {
		items: ItemBank | Bank;
		collectionLog?: boolean;
		filterLoot?: boolean;
		dontAddToTempCL?: boolean;
	}) {
		const res = await transactItems({
			collectionLog,
			itemsToAdd: new Bank(items),
			filterLoot,
			dontAddToTempCL,
			userID: this.id
		});
		this.user = res.newUser;
		return res;
	}

	async removeItemsFromBank(bankToRemove: Bank) {
		const res = await transactItems({
			userID: this.id,
			itemsToRemove: bankToRemove
		});
		this.user = res.newUser;
		return res;
	}

	hasEquipped(_item: number | string | string[] | number[], every = false) {
		const items = resolveItems(_item);
		if (items.length === 1 && allPetIDs.includes(items[0])) {
			const pet = this.user.minion_equippedPet;
			return pet === items[0];
		}

		for (const gear of Object.values(this.gear)) {
			if (gear.hasEquipped(items, every)) {
				return true;
			}
		}
		return false;
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

	get skillsAsLevels() {
		return getSkillsOfMahojiUser(this.user, true);
	}

	get minionIsBusy() {
		return minionIsBusy(this.id);
	}

	async incrementCreatureScore(creatureID: number, amountToAdd = 1) {
		const currentCreatureScores = this.user.creatureScores;
		const { newUser } = await mahojiUserSettingsUpdate(this.id, {
			creatureScores: addItemToBank(currentCreatureScores as ItemBank, creatureID, amountToAdd)
		});
		this.user = newUser;
	}
}
