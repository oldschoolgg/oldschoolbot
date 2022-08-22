import { userMention } from '@discordjs/builders';
import { Prisma, User, xp_gains_skill_enum } from '@prisma/client';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { calculateAddItemsToCLUpdates, getUserGear, mahojiUserSettingsUpdate } from '../mahoji/mahojiSettings';
import { BitField, projectiles, usernameCache } from './constants';
import { allPetIDs } from './data/CollectionsExport';
import { blowpipeDarts, validateBlowpipeData } from './minions/functions/blowpipeCommand';
import { AddXpParams, BlowpipeData } from './minions/types';
import { SkillsEnum } from './skilling/types';
import { ItemBank } from './types';
import { addItemToBank, getSkillsOfMahojiUser, itemNameFromID, percentChance } from './util';
import { determineRunes } from './util/determineRunes';
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

	async incrementKC(monsterID: number, amountToAdd = 1) {
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

	get blowpipe() {
		const blowpipe = this.user.blowpipe as any as BlowpipeData;
		validateBlowpipeData(blowpipe);
		return blowpipe;
	}

	async addItemsToCollectionLog(itemsToAdd: Bank) {
		const updates = await calculateAddItemsToCLUpdates({
			userID: this.id,
			items: itemsToAdd
		});
		const { newUser } = await mahojiUserSettingsUpdate(this.id, updates);
		this.user = newUser;
	}

	async specialRemoveItems(bankToRemove: Bank) {
		bankToRemove = determineRunes(this, bankToRemove);
		const bankRemove = new Bank();
		let dart: [Item, number] | null = null;
		let ammoRemove: [Item, number] | null = null;

		const realCost = bankToRemove.clone();
		const rangeGear = this.gear.range;
		const hasAvas = rangeGear.hasEquipped("Ava's assembler");
		const updates: Prisma.UserUpdateArgs['data'] = {};

		for (const [item, quantity] of bankToRemove.items()) {
			if (blowpipeDarts.includes(item)) {
				if (dart !== null) throw new Error('Tried to remove more than 1 blowpipe dart.');
				dart = [item, quantity];
				continue;
			}
			if (Object.values(projectiles).flat(2).includes(item.id)) {
				if (ammoRemove !== null) throw new Error('Tried to remove more than 1 ranged ammunition.');
				ammoRemove = [item, quantity];
				continue;
			}
			bankRemove.add(item.id, quantity);
		}

		if (ammoRemove) {
			const equippedAmmo = rangeGear.ammo?.item;
			if (!equippedAmmo) {
				throw new Error('No ammo equipped.');
			}
			if (equippedAmmo !== ammoRemove[0].id) {
				throw new Error(`Has ${itemNameFromID(equippedAmmo)}, but needs ${ammoRemove[0].name}.`);
			}
			const newRangeGear = { ...this.gear.range };
			const ammo = newRangeGear.ammo?.quantity;

			if (hasAvas) {
				let ammoCopy = ammoRemove[1];
				for (let i = 0; i < ammoCopy; i++) {
					if (percentChance(80)) {
						ammoRemove[1]--;
						realCost.remove(ammoRemove[0].id, 1);
					}
				}
			}
			if (!ammo || ammo < ammoRemove[1])
				throw new Error(
					`Not enough ${ammoRemove[0].name} equipped in range gear, you need ${
						ammoRemove![1]
					} but you have only ${ammo}.`
				);
			newRangeGear.ammo!.quantity -= ammoRemove![1];
			updates.gear_range = newRangeGear as any as Prisma.InputJsonObject;
		}

		if (dart) {
			if (hasAvas) {
				let copyDarts = dart![1];
				for (let i = 0; i < copyDarts; i++) {
					if (percentChance(80)) {
						realCost.remove(dart[0].id, 1);
						dart![1]--;
					}
				}
			}
			const scales = Math.ceil((10 / 3) * dart[1]);
			const rawBlowpipeData = this.blowpipe;
			if (!this.allItemsOwned().has('Toxic blowpipe') || !rawBlowpipeData) {
				throw new Error("You don't have a Toxic blowpipe.");
			}
			if (!rawBlowpipeData.dartID || !rawBlowpipeData.dartQuantity) {
				throw new Error('You have no darts in your Toxic blowpipe.');
			}
			if (rawBlowpipeData.dartQuantity < dart[1]) {
				throw new Error(
					`You don't have enough ${itemNameFromID(
						rawBlowpipeData.dartID
					)}s in your Toxic blowpipe, you need ${dart[1]}, but you have only ${rawBlowpipeData.dartQuantity}.`
				);
			}
			if (!rawBlowpipeData.scales || rawBlowpipeData.scales < scales) {
				throw new Error(
					`You don't have enough Zulrah's scales in your Toxic blowpipe, you need ${scales} but you have only ${rawBlowpipeData.scales}.`
				);
			}
			const bpData = { ...this.blowpipe };
			bpData.dartQuantity -= dart![1];
			bpData.scales -= scales;
			validateBlowpipeData(bpData);
			updates.blowpipe = bpData;
		}

		if (bankRemove.length > 0) {
			if (!this.bank.has(bankRemove)) {
				throw new Error(`You don't own: ${bankRemove.clone().remove(this.bank)}.`);
			}
			await transactItems({ userID: this.id, itemsToRemove: bankRemove });
		}
		const { newUser } = await mahojiUserSettingsUpdate(this.id, updates);
		this.user = newUser;
		return {
			realCost
		};
	}

	getCreatureScore(creatureID: number) {
		return (this.user.creatureScores as ItemBank)[creatureID] ?? 0;
	}
}
