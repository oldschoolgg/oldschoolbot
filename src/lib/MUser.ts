import { percentChance } from '@oldschoolgg/rng';
import { calcWhatPercent, cleanUsername, Emoji, isObject, sumArr, UserError, uniqueArr } from '@oldschoolgg/toolkit';
import { escapeMarkdown, userMention } from 'discord.js';
import {
	addItemToBank,
	Bank,
	convertXPtoLVL,
	EMonster,
	EquipmentSlot,
	type Item,
	type ItemBank,
	Items,
	resolveItems
} from 'oldschooljs';

import { addXP } from '@/lib/addXP.js';
import { modifyUserBusy, userIsBusy } from '@/lib/busyCounterCache.js';
import { generateAllGearImage, generateGearImage } from '@/lib/canvas/generateGearImage.js';
import type { IconPackID } from '@/lib/canvas/iconPacks.js';
import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { updateUserCl } from '@/lib/collection-log/databaseCl.js';
import { type CATier, CombatAchievements } from '@/lib/combat_achievements/combatAchievements.js';
import { BitField, MAX_LEVEL, projectiles } from '@/lib/constants.js';
import { bossCLItems } from '@/lib/data/Collections.js';
import { allPetIDs, avasDevices } from '@/lib/data/CollectionsExport.js';
import { degradeableItems } from '@/lib/degradeableItems.js';
import { mentionCommand } from '@/lib/discord/utils.js';
import type { GearSetup, UserFullGearSetup } from '@/lib/gear/types.js';
import { handleNewCLItems } from '@/lib/handleNewCLItems.js';
import { marketPriceOfBank } from '@/lib/marketPrices.js';
import backgroundImages from '@/lib/minions/data/bankBackgrounds.js';
import type { CombatOptionsEnum } from '@/lib/minions/data/combatConstants.js';
import { type AddMonsterXpParams, addMonsterXPRaw } from '@/lib/minions/functions/addMonsterXPRaw.js';
import { blowpipeDarts, validateBlowpipeData } from '@/lib/minions/functions/blowpipeCommand.js';
import type { AttackStyles } from '@/lib/minions/functions/index.js';
import type { AddXpParams, BlowpipeData, ClueBank } from '@/lib/minions/types.js';
import { getUsersPerkTier } from '@/lib/perkTiers.js';
import { roboChimpUserFetch } from '@/lib/roboChimp.js';
import { type MinigameName, type MinigameScore, Minigames } from '@/lib/settings/minigames.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';
import type { DetailedFarmingContract, FarmingContract } from '@/lib/skilling/skills/farming/utils/types.js';
import type { BankSortMethod } from '@/lib/sorts.js';
import { ChargeBank } from '@/lib/structures/Bank.js';
import { defaultGear, Gear } from '@/lib/structures/Gear.js';
import { GearBank } from '@/lib/structures/GearBank.js';
import { MUserStats } from '@/lib/structures/MUserStats.js';
import type { XPBank } from '@/lib/structures/XPBank.js';
import type { PrismaCompatibleJsonObject, SkillRequirements, Skills } from '@/lib/types/index.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { determineRunes } from '@/lib/util/determineRunes.js';
import { getKCByName } from '@/lib/util/getKCByName.js';
import { makeBadgeString } from '@/lib/util/makeBadgeString.js';
import { hasSkillReqsRaw } from '@/lib/util/smallUtils.js';
import { type TransactItemsArgs, transactItemsFromBank } from '@/lib/util/transactItemsFromBank.js';
import type { JsonKeys } from '@/lib/util.js';
import { timePerAlch, timePerAlchAgility } from '@/mahoji/lib/abstracted_commands/alchCommand.js';
import { getParsedStashUnits } from '@/mahoji/lib/abstracted_commands/stashUnitsCommand.js';
import type { activity_type_enum, GearSetupType, Prisma, User, UserStats, xp_gains_skill_enum } from '@/prisma/main.js';

export async function mahojiUserSettingsUpdate(user: string | bigint, data: Prisma.UserUncheckedUpdateInput) {
	try {
		const newUser = await global.prisma.user.update({
			data,
			where: {
				id: user.toString()
			}
		});

		return { newUser };
	} catch (err) {
		Logging.logError(err as Error, {
			user_id: user.toString(),
			updated_data: JSON.stringify(data)
		});
		throw err;
	}
}

function alchPrice(bank: Bank, item: Item, tripLength: number, agility?: boolean) {
	const maxCasts = Math.min(
		Math.floor(tripLength / (agility ? timePerAlchAgility : timePerAlch)),
		bank.amount(item.id)
	);
	return maxCasts * (item.highalch ?? 0);
}

export type SelectedUserStats<T extends Prisma.UserStatsSelect> = {
	[K in keyof T]: K extends keyof UserStats ? UserStats[K] : never;
};

export class MUserClass {
	user: Readonly<User>;
	id: string;

	skillsAsXP!: Required<Skills>;
	skillsAsLevels!: Required<Skills>;
	badgesString!: string;
	bitfield!: readonly BitField[];
	iconPackId!: IconPackID | null;

	private _bankLazy: Bank | null = null;
	private _clLazy: Bank | null = null;
	private _gearLazy: UserFullGearSetup | null = null;

	constructor(user: User) {
		this.user = user;
		this.id = user.id;
		this.updateProperties();
	}

	public get bank(): Bank {
		if (this._bankLazy) return this._bankLazy;
		this._bankLazy = new Bank(this.user.bank as ItemBank);
		this._bankLazy.freeze();
		return this._bankLazy;
	}

	public get cl(): Bank {
		if (this._clLazy) return this._clLazy;
		this._clLazy = new Bank(this.user.collectionLogBank as ItemBank);
		this._clLazy.freeze();
		return this._clLazy;
	}

	public get gear(): UserFullGearSetup {
		if (this._gearLazy) return this._gearLazy;
		this._gearLazy = {
			melee: new Gear((this.user.gear_melee as GearSetup | null) ?? { ...defaultGear }),
			mage: new Gear((this.user.gear_mage as GearSetup | null) ?? { ...defaultGear }),
			range: new Gear((this.user.gear_range as GearSetup | null) ?? { ...defaultGear }),
			misc: new Gear((this.user.gear_misc as GearSetup | null) ?? { ...defaultGear }),
			skilling: new Gear((this.user.gear_skilling as GearSetup | null) ?? { ...defaultGear }),
			wildy: new Gear((this.user.gear_wildy as GearSetup | null) ?? { ...defaultGear }),
			fashion: new Gear((this.user.gear_fashion as GearSetup | null) ?? { ...defaultGear }),
			other: new Gear((this.user.gear_other as GearSetup | null) ?? { ...defaultGear })
		};
		return this._gearLazy;
	}

	public get bankWithGP(): Bank {
		return new Bank(this.user.bank as ItemBank).add('Coins', this.GP).freeze();
	}

	public updateProperties() {
		this._bankLazy = null;
		this._clLazy = null;
		this._gearLazy = null;
		this.skillsAsXP = this.getSkills(false);
		this.skillsAsLevels = this.getSkills(true);

		this.badgesString = makeBadgeString(this.user.badges, this.isIronman);

		this.bitfield = this.user.bitfield as readonly BitField[];
		this.iconPackId = (this.user.icon_pack_id as IconPackID) ?? null;
	}

	public get gearBank() {
		return new GearBank({
			gear: this.gear,
			bank: this.bank,
			chargeBank: this.ownedChargeBank(),
			skillsAsXP: this.skillsAsXP,
			minionName: this.minionName
		});
	}

	countSkillsAtLeast99() {
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

	get skillsAsRequirements(): Required<SkillRequirements> {
		return { ...this.skillsAsLevels, combat: this.combatLevel };
	}

	favAlchs(duration: number, agility?: boolean) {
		const { bank } = this;
		return this.user.favorite_alchables
			.filter(id => bank.has(id))
			.map(id => Items.getItem(id))
			.filter(i => i !== null && i?.highalch !== undefined && i.highalch > 0 && i.tradeable)
			.sort((a, b) => alchPrice(bank, b!, duration, agility) - alchPrice(bank, a!, duration, agility)) as Item[];
	}

	async setAttackStyle(newStyles: AttackStyles[]) {
		await mahojiUserSettingsUpdate(this.id, {
			attack_style: uniqueArr(newStyles)
		});
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

	perkTier() {
		return getUsersPerkTier(this);
	}

	skillLevel(skill: xp_gains_skill_enum) {
		return this.skillsAsLevels[skill];
	}

	get minionName() {
		const prefix = this.isIronman ? Emoji.Ironman : '';
		const icon = this.user.minion_icon ?? Emoji.Minion;

		const strPrefix = prefix ? `${prefix} ` : '';

		return this.user.minion_name
			? `${strPrefix}${icon} **${escapeMarkdown(this.user.minion_name)}**`
			: `${strPrefix}${icon} Your minion`;
	}

	get mention() {
		return userMention(this.id);
	}

	get username() {
		return this.rawUsername;
	}

	get rawUsername() {
		return cleanUsername(this.user.username ?? globalClient.users.cache.get(this.id)?.username ?? 'Unknown');
	}

	get usernameOrMention() {
		return this.rawUsername;
	}

	get badgedUsername() {
		return `${this.badgesString} ${this.usernameOrMention}`.trim();
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
		const stats = await this.fetchStats();
		return (stats.monster_scores as ItemBank)[monsterID] ?? 0;
	}

	async getAllKCs() {
		const stats = await this.fetchStats();
		const rawKCs = stats.monster_scores as ItemBank;
		return new Proxy(rawKCs, {
			get(target, monsterNameOrId: string) {
				let monsterID: number;
				if (Number.isInteger(Number(monsterNameOrId))) {
					monsterID = Number(monsterNameOrId);
				} else {
					monsterID = EMonster[monsterNameOrId as keyof typeof EMonster];
				}
				const kc = target[monsterID] ?? 0;
				if (kc) return kc;
				return 0;
			}
		}) as Record<keyof typeof EMonster | number, number>;
	}

	async fetchMonsterScores() {
		const stats = await this.fetchStats();
		return stats.monster_scores as ItemBank;
	}

	attackClass(): 'range' | 'mage' | 'melee' {
		const styles = this.getAttackStyles();
		if (styles.includes('ranged')) return 'range';
		if (styles.includes('magic')) return 'mage';
		return 'melee';
	}

	getAttackStyles(): AttackStyles[] {
		const styles = this.user.attack_style;
		if (styles.length === 0) {
			return ['attack', 'strength', 'defence'];
		}
		return styles as AttackStyles[];
	}

	async calcActualClues() {
		const result: { id: number; qty: number }[] =
			await prisma.$queryRawUnsafe(`SELECT (data->>'ci')::int AS id, SUM((data->>'q')::int)::int AS qty
FROM activity
WHERE type = 'ClueCompletion'
AND user_id = '${this.id}'::bigint
AND data->>'ci' IS NOT NULL
AND completed = true
GROUP BY data->>'ci';`);
		const casketsCompleted = new Bank();
		for (const res of result) {
			const item = Items.get(res.id);
			if (!item) continue;
			casketsCompleted.add(item.id, res.qty);
		}
		const stats = await this.fetchStats();
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
		const stats = await this.fetchStats();
		const newKCs = new Bank(stats.monster_scores as ItemBank).add(monsterID, amountToAdd);
		await this.statsUpdate({
			monster_scores: newKCs.toJSON()
		});
		return { newKC: newKCs.amount(monsterID) };
	}

	public async addItemsToBank({
		items,
		collectionLog = false,
		filterLoot = true,
		dontAddToTempCL = false,
		neverUpdateHistory = false
	}: {
		items: ItemBank | Bank;
		collectionLog?: boolean;
		filterLoot?: boolean;
		dontAddToTempCL?: boolean;
		neverUpdateHistory?: boolean;
	}) {
		const res = await this.transactItems({
			collectionLog,
			itemsToAdd: new Bank(items),
			filterLoot,
			dontAddToTempCL,
			neverUpdateHistory
		});
		this.user = res.newUser;
		this.updateProperties();
		return res;
	}

	async removeItemsFromBank(bankToRemove: Bank) {
		const res = await this.transactItems({
			itemsToRemove: bankToRemove
		});
		this.user = res.newUser;
		this.updateProperties();
		return res;
	}

	async transactItems(options: Omit<TransactItemsArgs, 'userID'>) {
		const res = await transactItemsFromBank({ userID: this.user.id, ...options });
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

	hasEquippedOrInBank(...args: Parameters<InstanceType<typeof GearBank>['hasEquippedOrInBank']>) {
		return this.gearBank.hasEquippedOrInBank(...args);
	}

	public get allItemsOwned(): Bank {
		const bank = new Bank(this.bank);

		bank.add('Coins', Number(this.user.GP));
		if (this.user.minion_equippedPet) {
			bank.add(this.user.minion_equippedPet);
		}

		for (const setup of Object.values(this.gear)) {
			bank.add(setup.toBank());
		}

		return bank;
	}

	async fetchMinigameScores() {
		const userMinigames = await this.fetchMinigames();

		const scores: MinigameScore[] = [];
		for (const minigame of Minigames) {
			const score = userMinigames[minigame.column];
			scores.push({ minigame, score });
		}
		return scores;
	}

	async fetchMinigames() {
		const userMinigames = await prisma.minigame.upsert({
			where: { user_id: this.id },
			update: {},
			create: { user_id: this.id }
		});
		return userMinigames;
	}

	async fetchMinigameScore(minigame: MinigameName) {
		const userMinigames = await this.fetchMinigames();
		return userMinigames[minigame];
	}

	async incrementMinigameScore(minigame: MinigameName, amountToAdd = 1) {
		const result = await prisma.minigame.upsert({
			where: { user_id: this.id },
			update: { [minigame]: { increment: amountToAdd } },
			create: { user_id: this.id, [minigame]: amountToAdd }
		});

		return {
			newScore: result[minigame],
			entity: result
		};
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
				skills[key] = convertXPtoLVL(val, MAX_LEVEL);
			}
		}
		return skills;
	}

	get minionIsBusy() {
		return ActivityManager.minionIsBusy(this.id);
	}

	async incrementCreatureScore(creatureID: number, amountToAdd = 1) {
		const stats = await this.fetchStats();
		await this.statsUpdate({
			creature_scores: addItemToBank(stats.creature_scores as ItemBank, creatureID, amountToAdd)
		});
	}

	get blowpipe() {
		const blowpipe = this.user.blowpipe as any as BlowpipeData;
		validateBlowpipeData(blowpipe);
		return blowpipe;
	}

	hasCharges(chargeBank: ChargeBank) {
		const failureReasons: string[] = [];
		for (const [keyName, chargesToDegrade] of chargeBank.entries()) {
			const degradeableItem = degradeableItems.find(i => i.settingsKey === keyName);
			if (!degradeableItem) {
				throw new Error(`Invalid degradeable item key: ${keyName}`);
			}
			const currentCharges = this.user[degradeableItem.settingsKey];
			const newCharges = currentCharges - chargesToDegrade;
			if (newCharges < 0) {
				failureReasons.push(
					`You don't have enough ${degradeableItem.item.name} charges, you need ${chargesToDegrade}, but you have only ${currentCharges}.`
				);
			}
		}
		if (failureReasons.length > 0) {
			return {
				hasCharges: false,
				fullUserString: `${failureReasons.join(', ')}

Charge your items using ${mentionCommand('minion', 'charge')}.`
			};
		}
		return { hasCharges: true };
	}

	percentOfBossCLFinished() {
		const percentBossCLFinished = calcWhatPercent(
			this.cl.items().filter(i => bossCLItems.includes(i[0].id)).length,
			bossCLItems.length
		);
		return percentBossCLFinished;
	}

	async addItemsToCollectionLog(itemsToAdd: Bank) {
		const previousCL = this.cl.clone();
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

	async specialRemoveItems(bankToRemove: Bank, options?: { isInWilderness?: boolean }) {
		bankToRemove = determineRunes(this, bankToRemove);
		const bankRemove = new Bank();
		let dart: [Item, number] | null = null;
		let ammoRemove: [Item, number] | null = null;

		const gearKey = options?.isInWilderness ? 'wildy' : 'range';
		const realCost = bankToRemove.clone();
		const rangeGear = this.gear[gearKey];
		const avasDevice = avasDevices.find(avas => rangeGear.hasEquipped(avas.item.id));
		const updates: Prisma.UserUpdateArgs['data'] = {};

		for (const [item, quantity] of bankToRemove.items()) {
			if (blowpipeDarts.includes(item)) {
				if (dart !== null) throw new UserError('Tried to remove more than 1 blowpipe dart.');
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
				throw new UserError('No ammo equipped.');
			}
			if (equippedAmmo !== ammoRemove[0].id) {
				throw new UserError(
					`You have ${Items.itemNameFromId(equippedAmmo)} equipped as your range ammo, but you need: ${ammoRemove[0].name}.`
				);
			}
			const newRangeGear = { ...this.gear[gearKey] };
			const ammo = newRangeGear.ammo?.quantity;

			const projectileCategory = Object.values(projectiles).find(i => i.items.includes(equippedAmmo));
			if (avasDevice && projectileCategory?.savedByAvas) {
				const ammoCopy = ammoRemove[1];
				for (let i = 0; i < ammoCopy; i++) {
					if (percentChance(avasDevice.reduction)) {
						ammoRemove[1]--;
						realCost.remove(ammoRemove[0].id, 1);
					}
				}
			}
			if (!ammo || ammo < ammoRemove[1])
				throw new UserError(
					`Not enough ${ammoRemove[0].name} equipped in ${gearKey} gear, you need ${
						ammoRemove?.[1]
					} but you have only ${ammo}.`
				);
			newRangeGear.ammo!.quantity -= ammoRemove?.[1];
			if (newRangeGear.ammo!.quantity <= 0) newRangeGear.ammo = null;
			const updateKey = options?.isInWilderness ? 'gear_wildy' : 'gear_range';
			updates[updateKey] = newRangeGear as any as PrismaCompatibleJsonObject;
		}

		if (dart) {
			if (avasDevice) {
				const copyDarts = dart?.[1];
				for (let i = 0; i < copyDarts; i++) {
					if (percentChance(avasDevice.reduction)) {
						realCost.remove(dart[0].id, 1);
						dart![1]--;
					}
				}
			}
			const scales = Math.ceil((10 / 3) * dart[1]);
			const rawBlowpipeData = this.blowpipe;
			if (!this.allItemsOwned.has('Toxic blowpipe') || !rawBlowpipeData) {
				throw new UserError("You don't have a Toxic blowpipe.");
			}
			if (!rawBlowpipeData.dartID || !rawBlowpipeData.dartQuantity) {
				throw new UserError('You have no darts in your Toxic blowpipe.');
			}
			if (rawBlowpipeData.dartQuantity < dart[1]) {
				throw new UserError(
					`You don't have enough ${Items.itemNameFromId(
						rawBlowpipeData.dartID
					)}s in your Toxic blowpipe, you need ${dart[1]}, but you have only ${rawBlowpipeData.dartQuantity}.`
				);
			}
			if (!rawBlowpipeData.scales || rawBlowpipeData.scales < scales) {
				throw new UserError(
					`You don't have enough Zulrah's scales in your Toxic blowpipe, you need ${scales} but you have only ${rawBlowpipeData.scales}.`
				);
			}
			const bpData = { ...this.blowpipe };
			bpData.dartQuantity -= dart?.[1];
			bpData.scales -= scales;
			validateBlowpipeData(bpData);
			updates.blowpipe = bpData;
		}

		if (bankRemove.length > 0) {
			if (!this.bankWithGP.has(bankRemove)) {
				throw new UserError(`You don't own: ${bankRemove.clone().remove(this.bankWithGP)}.`);
			}
			await this.transactItems({ itemsToRemove: bankRemove });
		}
		const { newUser } = await mahojiUserSettingsUpdate(this.id, updates);
		this.user = newUser;
		this.updateProperties();
		return {
			realCost
		};
	}

	async getCreatureScore(creatureID: number) {
		const stats = await this.fetchStats();
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
			collectionLogBank: new Bank(this.user.collectionLogBank as ItemBank).add(items).toJSON()
		};

		if (!dontAddToTempCL) {
			updates.temp_cl = new Bank(this.user.temp_cl as ItemBank).add(items).toJSON();
		}
		return updates;
	}

	hasSkillReqs(requirements: SkillRequirements) {
		return hasSkillReqsRaw(this.skillsAsRequirements, requirements);
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

	async fetchStats() {
		let result = await prisma.userStats.findFirst({
			where: {
				user_id: BigInt(this.id)
			}
		});

		if (!result) {
			result = await prisma.userStats.upsert({
				where: {
					user_id: BigInt(this.id)
				},
				create: {
					user_id: BigInt(this.id)
				},
				update: {}
			});
		}

		return result;
	}

	async fetchMStats() {
		return new MUserStats(await this.fetchStats());
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

	farmingInfo() {
		return Farming.getFarmingInfoFromUser(this);
	}

	farmingContract(): DetailedFarmingContract {
		const currentFarmingContract = this.user.minion_farmingContract as FarmingContract | null;
		const plant = !currentFarmingContract
			? undefined
			: Farming.Plants.find(i => i.name === currentFarmingContract?.plantToGrow);
		const farmingInfo = Farming.getFarmingInfoFromUser(this);
		return {
			contract: currentFarmingContract ?? Farming.defaultFarmingContract,
			plant,
			matchingPlantedCrop: plant
				? farmingInfo.patchesDetailed.find(i => i.plant && i.plant === plant)
				: undefined,
			farmingInfo
		};
	}

	generateGearImage({ setupType, gearSetup }: { setupType?: GearSetupType | 'all'; gearSetup?: Gear }) {
		if (setupType === 'all') {
			return generateAllGearImage({
				equippedPet: this.user.minion_equippedPet,
				bankBgHexColor: this.user.bank_bg_hex,
				iconPackId: this.iconPackId,
				farmingContract: this.farmingContract(),
				gear: this.gear
			});
		}
		return generateGearImage({
			gearSetup: setupType ? this.gear[setupType] : gearSetup!,
			gearType: setupType,
			petID: this.user.minion_equippedPet,
			farmingContract: this.farmingContract()
		});
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

	buildTertiaryItemChanges(hasRingOfWealthI = false, inWildy = false, onTask = false) {
		const changes = new Map<string, number>();

		const tiers = Object.keys(CombatAchievements) as Array<keyof typeof CombatAchievements>;
		for (const tier of tiers) {
			let change = hasRingOfWealthI && inWildy ? 50 : 0;
			if (this.hasCompletedCATier(tier)) {
				change += 5;
			}
			changes.set(`Clue scroll (${tier})`, change);
		}

		if (inWildy) changes.set('Giant key', 50);

		if (inWildy && !onTask) {
			changes.set('Mossy key', 60);
		} else if (!inWildy && onTask) {
			changes.set('Mossy key', 66.67);
		} else if (inWildy && onTask) {
			changes.set('Mossy key', 77.6);
		}

		return changes;
	}

	ownedChargeBank() {
		const chargeBank = new ChargeBank();
		for (const degradeableItem of degradeableItems) {
			const charges = this.user[degradeableItem.settingsKey];
			if (charges) {
				chargeBank.add(degradeableItem.settingsKey, charges);
			}
		}
		return chargeBank;
	}

	async addXPBank(xpBank: XPBank) {
		const results = [];
		for (const options of xpBank.xpList) {
			results.push(await this.addXP(options));
		}
		return results.join(' ');
	}

	async checkBankBackground() {
		if (this.bitfield.includes(BitField.isModerator)) {
			return;
		}
		const resetBackground = async () => {
			await this.update({ bankBackground: 1 });
		};
		const background = backgroundImages.find(i => i.id === this.user.bankBackground);
		if (!background) {
			return resetBackground();
		}
		if (background.id === 1) return;
		if (background.storeBitField && this.user.store_bitfield.includes(background.storeBitField)) {
			return;
		}
		if (background.perkTierNeeded && this.perkTier() >= background.perkTierNeeded) {
			return;
		}
		if (background.bitfield && this.bitfield.includes(background.bitfield)) {
			return;
		}
		if (!background.storeBitField && !background.perkTierNeeded && !background.bitfield) {
			return;
		}
		return resetBackground();
	}

	async fetchRobochimpUser() {
		return roboChimpUserFetch(this.id);
	}

	async forceUnequip(setup: GearSetupType, slot: EquipmentSlot, reason: string) {
		const gear = this.gear[setup].raw();
		const equippedInSlot = gear[slot];
		if (!equippedInSlot) {
			return { refundBank: new Bank() };
		}
		gear[slot] = null;

		const actualItem = Items.getOrThrow(equippedInSlot.item);
		const refundBank = new Bank();
		if (actualItem) {
			refundBank.add(actualItem.id, equippedInSlot.quantity);
		}

		await this.update({
			[`gear_${setup}`]: gear as any as PrismaCompatibleJsonObject
		});
		if (refundBank.length > 0) {
			await this.addItemsToBank({
				items: refundBank,
				collectionLog: false
			});
		}

		Logging.logDebug(
			`ForceUnequip User[${this.id}] in ${setup} slot[${slot}] ${JSON.stringify(equippedInSlot)}: ${reason}`
		);

		return { refundBank };
	}

	async fetchStashUnits() {
		const units = await getParsedStashUnits(this.id);
		return units;
	}

	async validateEquippedGear() {
		const itemsUnequippedAndRefunded = new Bank();
		for (const [gearSetupName, gearSetup] of Object.entries(this.gear) as [GearSetupType, GearSetup][]) {
			if (gearSetup['2h'] !== null) {
				if (gearSetup.weapon?.item) {
					const { refundBank } = await this.forceUnequip(
						gearSetupName,
						EquipmentSlot.Weapon,
						'2h Already equipped'
					);
					itemsUnequippedAndRefunded.add(refundBank);
				}
				if (gearSetup.shield?.item) {
					const { refundBank } = await this.forceUnequip(
						gearSetupName,
						EquipmentSlot.Shield,
						'2h Already equipped'
					);
					itemsUnequippedAndRefunded.add(refundBank);
				}
			}
			for (const slot of Object.values(EquipmentSlot)) {
				const item = gearSetup[slot];
				if (!item) continue;
				const osItem = Items.get(item.item);
				if (!osItem) {
					const { refundBank } = await this.forceUnequip(gearSetupName, slot, 'Invalid item');
					itemsUnequippedAndRefunded.add(refundBank);
					continue;
				}
				if (osItem.equipment?.slot !== slot) {
					const { refundBank } = await this.forceUnequip(gearSetupName, slot, 'Wrong slot');
					itemsUnequippedAndRefunded.add(refundBank);
				}
				if (osItem.equipment?.requirements && !this.hasSkillReqs(osItem.equipment.requirements)) {
					const { refundBank } = await this.forceUnequip(gearSetupName, slot, 'Doesnt meet requirements');
					itemsUnequippedAndRefunded.add(refundBank);
				}
			}
		}
		return {
			itemsUnequippedAndRefunded
		};
	}

	async calculateNetWorth() {
		const bank = this.allItemsOwned.clone();
		const activeListings = await prisma.gEListing.findMany({
			where: {
				user_id: this.id,
				quantity_remaining: {
					gt: 0
				},
				fulfilled_at: null,
				cancelled_at: null
			},
			include: {
				buyTransactions: true,
				sellTransactions: true
			}
		});
		for (const listing of activeListings) {
			if (listing.type === 'Sell') {
				bank.add(listing.item_id, listing.quantity_remaining);
			} else {
				bank.add('Coins', Number(listing.asking_price_per_item) * listing.quantity_remaining);
			}
		}
		const activeGiveaways = await prisma.giveaway.findMany({
			where: {
				completed: false,
				user_id: this.id
			}
		});
		for (const giveaway of activeGiveaways) {
			bank.add(giveaway.loot as ItemBank);
		}
		const gifts = await prisma.giftBox.findMany({
			where: {
				owner_id: this.id
			}
		});
		for (const gift of gifts) {
			bank.add(gift.items as ItemBank);
		}
		return {
			bank,
			value: marketPriceOfBank(bank)
		};
	}

	hasGracefulEquipped() {
		for (const gear of Object.values(this.gear)) {
			if (
				gear.hasEquipped(
					[
						'Graceful hood',
						'Graceful top',
						'Graceful legs',
						'Graceful boots',
						'Graceful gloves',
						'Graceful cape'
					],
					true
				)
			) {
				return true;
			}
		}
		return false;
	}

	async statsUpdate(data: Omit<Prisma.UserStatsUpdateInput, 'user_id'>) {
		const id = BigInt(this.id);

		const result = await prisma.userStats.update({
			data,
			where: {
				user_id: id
			}
		});
		return result;
	}

	async statsBankUpdate(key: JsonKeys<UserStats>, bank: Bank) {
		if (!key) throw new Error('No key provided to userStatsBankUpdate');
		const stats = await this.fetchStats();
		const currentItemBank = stats[key] as ItemBank;
		if (!isObject(currentItemBank)) {
			throw new Error(`Key ${key} is not an object.`);
		}
		await this.statsUpdate({
			[key]: bank.clone().add(currentItemBank).toJSON()
		});
	}

	async updateGPTrackSetting(setting: 'gp_dice' | 'gp_luckypick' | 'gp_slots', amount: number) {
		this.statsUpdate({
			[setting]: {
				increment: amount
			}
		});
	}

	calcMaxTripLength(activity: activity_type_enum) {
		return calcMaxTripLength(this, activity);
	}

	async addMonsterXP(params: AddMonsterXpParams) {
		const res = addMonsterXPRaw({ ...params, attackStyles: this.getAttackStyles() });
		const result = await this.addXPBank(res);
		return `**XP Gains:** ${result}`;
	}

	async updateCL() {
		await updateUserCl(this.id);
	}

	modifyBusy(type: 'lock' | 'unlock', reason: string): void {
		modifyUserBusy({ type, reason, userID: this.id });
	}
}
declare global {
	export type MUser = MUserClass;
	var mUserFetch: typeof srcMUserFetch;
	var GlobalMUserClass: typeof MUserClass;
}

async function srcMUserFetch(userID: string, updates?: Prisma.UserUpdateInput) {
	const user =
		updates !== undefined
			? await prisma.user.upsert({
					create: {
						id: userID
					},
					update: updates,
					where: {
						id: userID
					}
				})
			: await prisma.user.findUnique({ where: { id: userID } });

	if (!user) {
		return srcMUserFetch(userID, {});
	}
	return new MUserClass(user);
}

global.mUserFetch = srcMUserFetch;
global.GlobalMUserClass = MUserClass;
