import { userMention } from '@discordjs/builders';
import { Prisma, User, UserStats, xp_gains_skill_enum } from '@prisma/client';
import { notEmpty, objectEntries, sumArr, uniqueArr } from 'e';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { SupportServer } from '../config';
import { timePerAlch } from '../mahoji/lib/abstracted_commands/alchCommand';
import { mahojiUsersSettingsFetch } from '../mahoji/mahojiSettings';
import { addXP } from './addXP';
import { userIsBusy } from './busyCounterCache';
import { ClueTiers } from './clues/clueTiers';
import { badges, BitField, Emoji, PerkTier, projectiles, Roles, usernameCache } from './constants';
import { allPetIDs } from './data/CollectionsExport';
import { getSimilarItems } from './data/similarItems';
import { GearSetup, UserFullGearSetup } from './gear/types';
import { CombatOptionsEnum } from './minions/data/combatConstants';
import { baseUserKourendFavour, UserKourendFavour } from './minions/data/kourendFavour';
import { AttackStyles } from './minions/functions';
import { blowpipeDarts, validateBlowpipeData } from './minions/functions/blowpipeCommand';
import { AddXpParams, BlowpipeData } from './minions/types';
import { getMinigameEntity, Minigames, MinigameScore } from './settings/minigames';
import { prisma } from './settings/prisma';
import { SkillsEnum } from './skilling/types';
import { BankSortMethod } from './sorts';
import { defaultGear, Gear } from './structures/Gear';
import { ItemBank, Skills } from './types';
import { addItemToBank, assert, convertXPtoLVL, itemNameFromID, percentChance } from './util';
import { determineRunes } from './util/determineRunes';
import { getKCByName } from './util/getKCByName';
import getOSItem from './util/getOSItem';
import { logError } from './util/logError';
import { minionIsBusy } from './util/minionIsBusy';
import { minionName } from './util/minionUtils';
import resolveItems from './util/resolveItems';

export async function mahojiUserSettingsUpdate(user: string | bigint, data: Prisma.UserUpdateArgs['data']) {
	try {
		const newUser = await prisma.user.update({
			data,
			where: {
				id: user.toString()
			}
		});

		return { newUser };
	} catch (err) {
		logError(err, {
			user_id: user.toString(),
			updated_data: JSON.stringify(data)
		});
		throw err;
	}
}

function alchPrice(bank: Bank, item: Item, tripLength: number) {
	const maxCasts = Math.min(Math.floor(tripLength / timePerAlch), bank.amount(item.id));
	return maxCasts * (item.highalch ?? 0);
}

const tier3ElligibleBits = [
	BitField.IsPatronTier3,
	BitField.isContributor,
	BitField.isModerator,
	BitField.IsWikiContributor
];

const perkTierCache = new Map<string, number>();

export function syncPerkTierOfUser(user: MUser) {
	perkTierCache.set(user.id, user.perkTier(true));
}

export class MUserClass {
	user: Readonly<User>;
	id: string;

	constructor(user: User) {
		this.user = user;
		this.id = user.id;

		syncPerkTierOfUser(this);
	}

	countSkillsAtleast99() {
		return Object.values(this.skillsAsLevels).filter(lvl => lvl >= 99).length;
	}

	async update(data: Prisma.UserUpdateArgs['data']) {
		const result = await mahojiUserSettingsUpdate(this.id, data);
		this.user = result.newUser;
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

	openableScores() {
		return this.user.openable_scores as ItemBank;
	}

	async setAttackStyle(newStyles: AttackStyles[]) {
		await mahojiUserSettingsUpdate(this.id, {
			attack_style: uniqueArr(newStyles)
		});
	}

	get bankWithGP() {
		return this.bank.add('Coins', this.GP);
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

	get gear(): UserFullGearSetup {
		return {
			melee: new Gear((this.user.gear_melee as GearSetup | null) ?? { ...defaultGear }),
			mage: new Gear((this.user.gear_mage as GearSetup | null) ?? { ...defaultGear }),
			range: new Gear((this.user.gear_range as GearSetup | null) ?? { ...defaultGear }),
			misc: new Gear((this.user.gear_misc as GearSetup | null) ?? { ...defaultGear }),
			skilling: new Gear((this.user.gear_skilling as GearSetup | null) ?? { ...defaultGear }),
			wildy: new Gear((this.user.gear_wildy as GearSetup | null) ?? { ...defaultGear }),
			fashion: new Gear((this.user.gear_fashion as GearSetup | null) ?? { ...defaultGear }),
			other: new Gear((this.user.gear_other as GearSetup | null) ?? { ...defaultGear })
		};
	}

	get bank() {
		return new Bank(this.user.bank as ItemBank);
	}

	get sacrificedItems() {
		return new Bank(this.user.sacrificedBank as ItemBank);
	}

	get cl() {
		return new Bank(this.user.collectionLogBank as ItemBank);
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

	getKC(monsterID: number) {
		return (this.user.monsterScores as ItemBank)[monsterID] ?? 0;
	}

	getAttackStyles(): AttackStyles[] {
		const styles = this.user.attack_style;
		if (styles.length === 0) {
			return [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence];
		}
		return styles as AttackStyles[];
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

	get skillsAsXP() {
		return this.getSkills(false);
	}

	get skillsAsLevels() {
		return this.getSkills(true);
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
		const updates = this.calculateAddItemsToCLUpdates({
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
			if (!this.bankWithGP.has(bankRemove)) {
				throw new Error(`You don't own: ${bankRemove.clone().remove(this.bankWithGP)}.`);
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
		this.user = await mahojiUsersSettingsFetch(this.id);
	}

	async fetchStats(): Promise<UserStats> {
		const result = await prisma.userStats.upsert({
			where: {
				user_id: BigInt(this.id)
			},
			create: {
				user_id: BigInt(this.id)
			},
			update: {}
		});
		if (!result) throw new Error(`fetchStats returned no result for ${this.id}`);
		return result;
	}

	clueScores() {
		return Object.entries(this.openableScores())
			.map(entry => {
				const tier = ClueTiers.find(i => i.id === parseInt(entry[0]));
				if (!tier) return;
				return {
					tier,
					casket: getOSItem(tier.id),
					clueScroll: getOSItem(tier.scrollID),
					opened: this.openableScores()[tier.id] ?? 0
				};
			})
			.filter(notEmpty);
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
}
declare global {
	export type MUser = MUserClass;
}
export async function srcMUserFetch(userID: string | string) {
	const user = await mahojiUsersSettingsFetch(userID);
	return new MUserClass(user);
}

declare global {
	const mUserFetch: typeof srcMUserFetch;
}
declare global {
	namespace NodeJS {
		interface Global {
			mUserFetch: typeof srcMUserFetch;
		}
	}
}
global.mUserFetch = srcMUserFetch;

export function getUsersPerkTier(
	userOrBitfield: MUser | User | BitField[],
	noCheckOtherAccounts?: boolean
): PerkTier | 0 {
	if (userOrBitfield instanceof MUserClass && userOrBitfield.user.premium_balance_tier !== null) {
		const date = userOrBitfield.user.premium_balance_expiry_date;
		if (date && Date.now() < date) {
			return userOrBitfield.user.premium_balance_tier + 1;
		} else if (date && Date.now() > date) {
			userOrBitfield
				.update({
					premium_balance_tier: null,
					premium_balance_expiry_date: null
				})
				.catch(e => {
					logError(e, { user_id: userOrBitfield.id, message: 'Could not remove premium time' });
				});
		}
	}

	if (noCheckOtherAccounts !== true && userOrBitfield instanceof MUserClass) {
		let main = userOrBitfield.user.main_account;
		const allAccounts: string[] = [...userOrBitfield.user.ironman_alts, userOrBitfield.id];
		if (main) {
			allAccounts.push(main);
		}

		const allAccountTiers = allAccounts.map(id => perkTierCache.get(id)).filter(notEmpty);

		const highestAccountTier = Math.max(0, ...allAccountTiers);
		return highestAccountTier;
	}

	const bitfield = Array.isArray(userOrBitfield) ? userOrBitfield : userOrBitfield.bitfield;

	if (bitfield.includes(BitField.IsPatronTier6)) {
		return PerkTier.Seven;
	}

	if (bitfield.includes(BitField.IsPatronTier5)) {
		return PerkTier.Six;
	}

	if (bitfield.includes(BitField.IsPatronTier4)) {
		return PerkTier.Five;
	}

	if (tier3ElligibleBits.some(bit => bitfield.includes(bit))) {
		return PerkTier.Four;
	}

	if (bitfield.includes(BitField.IsPatronTier2)) {
		return PerkTier.Three;
	}

	if (
		bitfield.includes(BitField.IsPatronTier1) ||
		bitfield.includes(BitField.HasPermanentTierOne) ||
		bitfield.includes(BitField.BothBotsMaxedFreeTierOnePerks)
	) {
		return PerkTier.Two;
	}

	if (userOrBitfield instanceof MUserClass) {
		const guild = globalClient.guilds.cache.get(SupportServer);
		const member = guild?.members.cache.get(userOrBitfield.id);
		if (member && [Roles.Booster].some(roleID => member.roles.cache.has(roleID))) {
			return PerkTier.One;
		}
	}

	return 0;
}
