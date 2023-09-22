import { userMention } from '@discordjs/builders';
import { Prisma, User, UserStats, xp_gains_skill_enum } from '@prisma/client';
import { calcWhatPercent, objectEntries, sumArr, uniqueArr } from 'e';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { timePerAlch } from '../mahoji/lib/abstracted_commands/alchCommand';
import { userStatsUpdate } from '../mahoji/mahojiSettings';
import { addXP } from './addXP';
import { userIsBusy } from './busyCounterCache';
import { ClueTiers } from './clues/clueTiers';
import { CATier, CombatAchievements } from './combat_achievements/combatAchievements';
import { badges, BitField, Emoji, projectiles, usernameCache } from './constants';
import { bossCLItems } from './data/Collections';
import { allPetIDs } from './data/CollectionsExport';
import { getSimilarItems } from './data/similarItems';
import { GearSetup, UserFullGearSetup } from './gear/types';
import { handleNewCLItems } from './handleNewCLItems';
import { CombatOptionsEnum } from './minions/data/combatConstants';
import { baseUserKourendFavour, UserKourendFavour } from './minions/data/kourendFavour';
import { defaultFarmingContract } from './minions/farming';
import { FarmingContract } from './minions/farming/types';
import { AttackStyles } from './minions/functions';
import { blowpipeDarts, validateBlowpipeData } from './minions/functions/blowpipeCommand';
import { AddXpParams, BlowpipeData, ClueBank } from './minions/types';
import { getUsersPerkTier, syncPerkTierOfUser } from './perkTiers';
import { getMinigameEntity, Minigames, MinigameScore } from './settings/minigames';
import { prisma } from './settings/prisma';
import { getFarmingInfoFromUser } from './skilling/functions/getFarmingInfo';
import Farming from './skilling/skills/farming';
import { SkillsEnum } from './skilling/types';
import { BankSortMethod } from './sorts';
import { defaultGear, Gear } from './structures/Gear';
import { ItemBank, Skills } from './types';
import { addItemToBank, assert, convertXPtoLVL, itemNameFromID, percentChance } from './util';
import { determineRunes } from './util/determineRunes';
import { getKCByName } from './util/getKCByName';
import getOSItem, { getItem } from './util/getOSItem';
import { logError } from './util/logError';
import { minionIsBusy } from './util/minionIsBusy';
import { minionName } from './util/minionUtils';
import resolveItems from './util/resolveItems';
import { TransactItemsArgs } from './util/transactItemsFromBank';

export async function mahojiUserSettingsUpdate(user: string | bigint, data: Prisma.UserUncheckedUpdateInput) {
	try {
		const newUser = await prisma.user.update({
			data,
			where: {
				id: user.toString()
			}
		});

		return { newUser };
	} catch (err) {
		logError(
			err,
			{
				user_id: user.toString()
			},
			{
				user_id: user.toString(),
				updated_data: JSON.stringify(data)
			}
		);
		throw err;
	}
}

function alchPrice(bank: Bank, item: Item, tripLength: number) {
	const maxCasts = Math.min(Math.floor(tripLength / timePerAlch), bank.amount(item.id));
	return maxCasts * (item.highalch ?? 0);
}

export type SelectedUserStats<T extends Prisma.UserStatsSelect> = {
	[K in keyof T]: K extends keyof UserStats ? UserStats[K] : never;
};

export class MUserClass {
	user: Readonly<User>;
	id: string;
	bank!: Bank;
	bankWithGP!: Bank;
	cl!: Bank;
	allItemsOwned!: Bank;
	gear!: UserFullGearSetup;
	skillsAsXP!: Required<Skills>;
	skillsAsLevels!: Required<Skills>;

	constructor(user: User) {
		this.user = user;
		this.id = user.id;
		this.updateProperties();

		syncPerkTierOfUser(this);
	}

	private updateProperties() {
		this.bank = new Bank(this.user.bank as ItemBank);
		this.bank.freeze();

		this.bankWithGP = new Bank(this.user.bank as ItemBank);
		this.bankWithGP.add('Coins', this.GP);
		this.bankWithGP.freeze();

		this.cl = new Bank(this.user.collectionLogBank as ItemBank);
		this.cl.freeze();

		this.gear = {
			melee: new Gear((this.user.gear_melee as GearSetup | null) ?? { ...defaultGear }),
			mage: new Gear((this.user.gear_mage as GearSetup | null) ?? { ...defaultGear }),
			range: new Gear((this.user.gear_range as GearSetup | null) ?? { ...defaultGear }),
			misc: new Gear((this.user.gear_misc as GearSetup | null) ?? { ...defaultGear }),
			skilling: new Gear((this.user.gear_skilling as GearSetup | null) ?? { ...defaultGear }),
			wildy: new Gear((this.user.gear_wildy as GearSetup | null) ?? { ...defaultGear }),
			fashion: new Gear((this.user.gear_fashion as GearSetup | null) ?? { ...defaultGear }),
			other: new Gear((this.user.gear_other as GearSetup | null) ?? { ...defaultGear })
		};

		this.allItemsOwned = this.calculateAllItemsOwned();
		this.allItemsOwned.freeze();

		this.skillsAsXP = this.getSkills(false);
		this.skillsAsLevels = this.getSkills(true);
	}

	countSkillsAtleast99() {
		return Object.values(this.skillsAsLevels).filter(lvl => lvl >= 99).length;
	}

	async update(data: Prisma.UserUncheckedUpdateInput) {
		const result = await mahojiUserSettingsUpdate(this.id, data);
		this.user = result.newUser;
		this.updateProperties();
		return result;
	}

	get combatLevel() {
		const { defence, ranged, hitpoints, magic, prayer, attack, strength } = this.skillsAsLevels;

		const base = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
		const melee = 0.325 * (attack + strength);
		const range = 0.325 * (Math.floor(ranged / 2) + ranged);
		const mage = 0.325 * (Math.floor(magic / 2) + magic);
		return Math.floor(base + Math.max(melee, range, mage));
	}

	favAlchs(duration: number) {
		const { bank } = this;
		return this.user.favorite_alchables
			.filter(id => bank.has(id))
			.map(getOSItem)
			.filter(i => i.highalch !== undefined && i.highalch > 0 && i.tradeable)
			.sort((a, b) => alchPrice(bank, b, duration) - alchPrice(bank, a, duration));
	}

	async setAttackStyle(newStyles: AttackStyles[]) {
		await mahojiUserSettingsUpdate(this.id, {
			attack_style: uniqueArr(newStyles)
		});
	}

	get kourendFavour() {
		const favour = this.user.kourend_favour as any as UserKourendFavour | null;
		if (favour === null) return { ...baseUserKourendFavour };
		assert(typeof favour.Arceuus === 'number', `kourendFavour should return valid data for ${this.id}`);
		return favour;
	}

	get isBusy() {
		return userIsBusy(this.id);
	}

	get totalLevel() {
		return sumArr(Object.values(this.skillsAsLevels));
	}

	get bankSortMethod() {
		return this.user.bank_sort_method as BankSortMethod | null;
	}

	get combatOptions() {
		return this.user.combat_options as readonly CombatOptionsEnum[];
	}

	get isIronman() {
		return this.user.minion_ironman;
	}

	get GP() {
		return Number(this.user.GP);
	}

	get bitfield() {
		return this.user.bitfield as readonly BitField[];
	}

	perkTier(noCheckOtherAccounts?: boolean | undefined) {
		return getUsersPerkTier(this, noCheckOtherAccounts);
	}

	skillLevel(skill: xp_gains_skill_enum) {
		return this.skillsAsLevels[skill];
	}

	get minionName() {
		return minionName(this);
	}

	get mention() {
		return userMention(this.id);
	}

	get rawUsername() {
		return globalClient.users.cache.get(this.id)?.username ?? usernameCache.get(this.id) ?? 'Unknown';
	}

	get usernameOrMention() {
		return usernameCache.get(this.id) ?? this.mention;
	}

	get badgeString() {
		const rawBadges = this.user.badges.map(num => badges[num]);
		if (this.isIronman) {
			rawBadges.push(Emoji.Ironman);
		}
		return rawBadges.join(' ');
	}

	get badgedUsername() {
		return `${this.badgeString} ${this.usernameOrMention}`;
	}

	toString() {
		return this.mention;
	}

	get QP() {
		return this.user.QP;
	}

	get autoFarmFilter() {
		return this.user.auto_farm_filter;
	}

	addXP(params: AddXpParams) {
		return addXP(this, params);
	}

	async getKC(monsterID: number) {
		const stats = await this.fetchStats({ monster_scores: true });
		return (stats.monster_scores as ItemBank)[monsterID] ?? 0;
	}

	async fetchMonsterScores() {
		const stats = await this.fetchStats({ monster_scores: true });
		return stats.monster_scores as ItemBank;
	}

	attackClass(): 'range' | 'mage' | 'melee' {
		const styles = this.getAttackStyles();
		if (styles.includes(SkillsEnum.Ranged)) return 'range';
		if (styles.includes(SkillsEnum.Magic)) return 'mage';
		return 'melee';
	}

	getAttackStyles(): AttackStyles[] {
		const styles = this.user.attack_style;
		if (styles.length === 0) {
			return [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence];
		}
		return styles as AttackStyles[];
	}

	async calcActualClues() {
		const result: { id: number; qty: number }[] =
			await prisma.$queryRawUnsafe(`SELECT (data->>'clueID')::int AS id, SUM((data->>'quantity')::int) AS qty
FROM activity
WHERE type = 'ClueCompletion'
AND user_id = '${this.id}'::bigint
AND data->>'clueID' IS NOT NULL
AND completed = true
GROUP BY data->>'clueID';`);
		const casketsCompleted = new Bank();
		for (const res of result) {
			const item = getItem(res.id);
			if (!item) continue;
			casketsCompleted.add(item.id, res.qty);
		}
		const stats = await this.fetchStats({ openable_scores: true });
		const opens = new Bank(stats.openable_scores as ItemBank);

		// Actual clues are only ones that you have: received in your cl, completed in trips, and opened.
		const actualClues = new Bank();

		for (const [item, qtyCompleted] of casketsCompleted.items()) {
			const clueTier = ClueTiers.find(i => i.id === item.id)!;
			actualClues.add(
				clueTier.scrollID,
				Math.min(qtyCompleted, this.cl.amount(clueTier.scrollID), opens.amount(clueTier.id))
			);
		}

		const clueCounts = {} as ClueBank;

		for (const tier of ClueTiers) clueCounts[tier.name] = 0;

		for (const [item, qty] of actualClues.items()) {
			const clueTier = ClueTiers.find(i => i.scrollID === item.id)!;
			clueCounts[clueTier.name] = qty;
		}

		return { actualCluesBank: actualClues, clueCounts };
	}

	async incrementKC(monsterID: number, amountToAdd = 1) {
		const stats = await this.fetchStats({ monster_scores: true });
		const newKCs = new Bank(stats.monster_scores as ItemBank).add(monsterID, amountToAdd);
		await userStatsUpdate(
			this.id,
			{
				monster_scores: newKCs.bank
			},
			{}
		);
		return { newKC: newKCs.amount(monsterID) };
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
		this.updateProperties();
		return res;
	}

	async removeItemsFromBank(bankToRemove: Bank) {
		const res = await transactItems({
			userID: this.id,
			itemsToRemove: bankToRemove
		});
		this.user = res.newUser;
		this.updateProperties();
		return res;
	}

	async transactItems(options: Omit<TransactItemsArgs, 'userID'>) {
		const res = await transactItems({ userID: this.user.id, ...options });
		this.user = res.newUser;
		this.updateProperties();
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

	private calculateAllItemsOwned(): Bank {
		const bank = new Bank(this.bank);

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

	async fetchMinigameScores() {
		const userMinigames = await getMinigameEntity(this.id);
		const scores: MinigameScore[] = [];
		for (const minigame of Minigames) {
			const score = userMinigames[minigame.column];
			scores.push({ minigame, score });
		}
		return scores;
	}

	async fetchMinigames() {
		return getMinigameEntity(this.id);
	}

	hasEquippedOrInBank(_items: string | number | (string | number)[], type: 'every' | 'one' = 'one') {
		const { bank } = this;
		const items = resolveItems(_items);
		for (const baseID of items) {
			const similarItems = [...getSimilarItems(baseID), baseID];
			const hasOneEquipped = similarItems.some(id => this.hasEquipped(id, true));
			const hasOneInBank = similarItems.some(id => bank.has(id));
			// If only one needs to be equipped, return true now if it is equipped.
			if (type === 'one' && (hasOneEquipped || hasOneInBank)) return true;
			// If all need to be equipped, return false now if not equipped.
			else if (type === 'every' && !hasOneEquipped && !hasOneInBank) {
				return false;
			}
		}
		return type === 'one' ? false : true;
	}

	getSkills(levels: boolean) {
		const skills: Required<Skills> = {
			agility: Number(this.user.skills_agility),
			cooking: Number(this.user.skills_cooking),
			fishing: Number(this.user.skills_fishing),
			mining: Number(this.user.skills_mining),
			smithing: Number(this.user.skills_smithing),
			woodcutting: Number(this.user.skills_woodcutting),
			firemaking: Number(this.user.skills_firemaking),
			runecraft: Number(this.user.skills_runecraft),
			crafting: Number(this.user.skills_crafting),
			prayer: Number(this.user.skills_prayer),
			fletching: Number(this.user.skills_fletching),
			farming: Number(this.user.skills_farming),
			herblore: Number(this.user.skills_herblore),
			thieving: Number(this.user.skills_thieving),
			hunter: Number(this.user.skills_hunter),
			construction: Number(this.user.skills_construction),
			magic: Number(this.user.skills_magic),
			attack: Number(this.user.skills_attack),
			strength: Number(this.user.skills_strength),
			defence: Number(this.user.skills_defence),
			ranged: Number(this.user.skills_ranged),
			hitpoints: Number(this.user.skills_hitpoints),
			slayer: Number(this.user.skills_slayer)
		};
		if (levels) {
			for (const [key, val] of Object.entries(skills) as [keyof Skills, number][]) {
				skills[key] = convertXPtoLVL(val);
			}
		}
		return skills;
	}

	get minionIsBusy() {
		return minionIsBusy(this.id);
	}

	async incrementCreatureScore(creatureID: number, amountToAdd = 1) {
		const stats = await this.fetchStats({ creature_scores: true });
		await userStatsUpdate(
			this.id,
			{
				creature_scores: addItemToBank(stats.creature_scores as ItemBank, creatureID, amountToAdd)
			},
			{}
		);
	}

	get blowpipe() {
		const blowpipe = this.user.blowpipe as any as BlowpipeData;
		validateBlowpipeData(blowpipe);
		return blowpipe;
	}

	percentOfBossCLFinished() {
		const percentBossCLFinished = calcWhatPercent(
			this.cl.items().filter(i => bossCLItems.includes(i[0].id)).length,
			bossCLItems.length
		);
		return percentBossCLFinished;
	}

	async addItemsToCollectionLog(itemsToAdd: Bank) {
		const previousCL = new Bank(this.cl.bank);
		const updates = this.calculateAddItemsToCLUpdates({
			items: itemsToAdd
		});
		await this.update(updates);
		const newCL = this.cl;
		await handleNewCLItems({ itemsAdded: itemsToAdd, user: this, newCL: this.cl, previousCL });
		return {
			previousCL,
			newCL,
			itemsAdded: itemsToAdd
		};
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
			const projectileCategory = Object.values(projectiles).find(i => i.items.includes(item.id));
			if (projectileCategory) {
				if (ammoRemove !== null) {
					bankRemove.add(item.id, quantity);
					continue;
				}
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

			const projectileCategory = Object.values(projectiles).find(i => i.items.includes(equippedAmmo));
			if (hasAvas && projectileCategory!.savedByAvas) {
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
			if (!this.allItemsOwned.has('Toxic blowpipe') || !rawBlowpipeData) {
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
			if (!this.bankWithGP.has(bankRemove)) {
				throw new Error(`You don't own: ${bankRemove.clone().remove(this.bankWithGP)}.`);
			}
			await transactItems({ userID: this.id, itemsToRemove: bankRemove });
		}
		const { newUser } = await mahojiUserSettingsUpdate(this.id, updates);
		this.user = newUser;
		this.updateProperties();
		return {
			realCost
		};
	}

	async getCreatureScore(creatureID: number) {
		const stats = await this.fetchStats({ creature_scores: true });
		return (stats.creature_scores as ItemBank)[creatureID] ?? 0;
	}

	calculateAddItemsToCLUpdates({
		items,
		dontAddToTempCL = false
	}: {
		items: Bank;
		dontAddToTempCL?: boolean;
	}): Prisma.UserUpdateArgs['data'] {
		const updates: Prisma.UserUpdateArgs['data'] = {
			collectionLogBank: new Bank(this.user.collectionLogBank as ItemBank).add(items).bank
		};

		if (!dontAddToTempCL) {
			updates.temp_cl = new Bank(this.user.temp_cl as ItemBank).add(items).bank;
		}
		return updates;
	}

	hasSkillReqs(requirements: Skills) {
		for (const [skillName, level] of objectEntries(requirements)) {
			if ((skillName as string) === 'combat') {
				if (this.combatLevel < level!) return false;
			} else if (this.skillLevel(skillName) < level!) {
				return false;
			}
		}
		return true;
	}

	allEquippedGearBank() {
		const bank = new Bank();
		for (const gear of Object.values(this.gear).flat()) {
			bank.add(gear.allItemsBank());
		}
		return bank;
	}

	owns(checkBank: Bank | number | string, { includeGear }: { includeGear: boolean } = { includeGear: false }) {
		const allItems = this.bank.clone().add('Coins', Number(this.user.GP));
		if (includeGear) {
			for (const [item, qty] of this.allEquippedGearBank().items()) {
				allItems.add(item.id, qty);
			}
		}
		return allItems.has(checkBank);
	}

	async sync() {
		const newUser = await prisma.user.findUnique({ where: { id: this.id } });
		if (!newUser) throw new Error(`Failed to sync user ${this.id}, no record was found`);
		this.user = newUser;
		this.updateProperties();
	}

	async fetchStats<T extends Prisma.UserStatsSelect>(selectKeys: T): Promise<SelectedUserStats<T>> {
		const keysToSelect = Object.keys(selectKeys).length === 0 ? { user_id: true } : selectKeys;
		const result = await prisma.userStats.upsert({
			where: {
				user_id: BigInt(this.id)
			},
			create: {
				user_id: BigInt(this.id)
			},
			update: {},
			select: keysToSelect
		});

		return result as SelectedUserStats<T>;
	}

	get logName() {
		return `${this.rawUsername}[${this.id}]`;
	}

	async getKCByName(name: string) {
		return getKCByName(this, name);
	}

	get hasMinion() {
		return Boolean(this.user.minion_hasBought);
	}

	farmingContract() {
		const currentFarmingContract = this.user.minion_farmingContract as FarmingContract | null;
		const plant = !currentFarmingContract
			? undefined
			: Farming.Plants.find(i => i.name === currentFarmingContract?.plantToGrow);
		const detailed = getFarmingInfoFromUser(this.user);
		return {
			contract: currentFarmingContract ?? defaultFarmingContract,
			plant,
			matchingPlantedCrop: plant ? detailed.patchesDetailed.find(i => i.plant && i.plant === plant) : undefined
		};
	}

	caPoints(): number {
		const keys = Object.keys(CombatAchievements) as CATier[];
		return keys
			.map(
				t =>
					CombatAchievements[t].tasks.filter(task => this.user.completed_ca_task_ids.includes(task.id))
						.length * CombatAchievements[t].taskPoints
			)
			.reduce((total, value) => total + value, 0);
	}

	hasCompletedCATier(tier: keyof typeof CombatAchievements): boolean {
		return this.caPoints() >= CombatAchievements[tier].rewardThreshold;
	}

	buildCATertiaryItemChanges() {
		const changes = new Map();
		if (this.hasCompletedCATier('easy')) {
			changes.set('Clue scroll (easy)', 5);
		}
		if (this.hasCompletedCATier('medium')) {
			changes.set('Clue scroll (medium)', 5);
		}
		if (this.hasCompletedCATier('hard')) {
			changes.set('Clue scroll (hard)', 5);
		}
		if (this.hasCompletedCATier('elite')) {
			changes.set('Clue scroll (elite)', 5);
		}
		return changes;
	}
}
declare global {
	export type MUser = MUserClass;
}

export async function srcMUserFetch(userID: string) {
	const user = await prisma.user.upsert({
		create: {
			id: userID
		},
		update: {},
		where: {
			id: userID
		}
	});
	return new MUserClass(user);
}

declare global {
	const mUserFetch: typeof srcMUserFetch;
	const GlobalMUserClass: typeof MUserClass;
}
declare global {
	namespace NodeJS {
		interface Global {
			mUserFetch: typeof srcMUserFetch;
			GlobalMUserClass: typeof MUserClass;
		}
	}
}
global.mUserFetch = srcMUserFetch;
global.GlobalMUserClass = MUserClass;
