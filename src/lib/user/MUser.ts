import { defaultGearSetup, type EquipmentSlot, type GearSetup } from '@oldschoolgg/gear';
import {
	type IBirdhouseData,
	type IBlowpipeData,
	type IFarmingContract,
	ZBirdhouseData,
	ZBlowpipeData,
	ZFarmingContract
} from '@oldschoolgg/schemas';
import { calcWhatPercent, isObject, type PerkTier, UserError, uniqueArr } from '@oldschoolgg/toolkit';
import { isValidDiscordSnowflake } from '@oldschoolgg/util';
import { Mutex } from 'async-mutex';
import { cryptoRng } from 'node-rng/crypto';
import { Bank, EMonster, type Item, type ItemBank, Items } from 'oldschooljs';
import { clone } from 'remeda';

import type {
	activity_type_enum,
	GearSetupType,
	Minigame,
	Prisma,
	User,
	UserStats,
	XpGainSource
} from '@/prisma/main.js';
import { addXP } from '@/lib/addXP.js';
import { MUTEX_CACHE } from '@/lib/cache.js';
import { generateAllGearImage, generateGearImage } from '@/lib/canvas/generateGearImage.js';
import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { CombatAchievements } from '@/lib/combat_achievements/combatAchievements.js';
import { bossCLItems } from '@/lib/data/Collections.js';
import { avasDevices } from '@/lib/data/CollectionsExport.js';
import type { Pet } from '@/lib/data/pets.js';
import { degradeableItems } from '@/lib/degradeableItems.js';
import { diaries, userhasDiaryTierSync } from '@/lib/diaries.js';
import { projectiles } from '@/lib/gear/projectiles.js';
import { handleNewCLItems } from '@/lib/handleNewCLItems.js';
import backgroundImages from '@/lib/minions/data/bankBackgrounds.js';
import { type AddMonsterXpParams, addMonsterXPRaw } from '@/lib/minions/functions/addMonsterXPRaw.js';
import { blowpipeDarts, validateBlowpipeData } from '@/lib/minions/functions/blowpipeCommand.js';
import getUserFoodFromBank, { type GetUserFoodFromBankParams } from '@/lib/minions/functions/getUserFoodFromBank.js';
import type { AttackStyles } from '@/lib/minions/functions/index.js';
import type { RemoveFoodFromUserParams } from '@/lib/minions/functions/removeFoodFromUser.js';
import removeFoodFromUser from '@/lib/minions/functions/removeFoodFromUser.js';
import type { AddXpParams, ClueBank, KillableMonster } from '@/lib/minions/types.js';
import { getUsersPerkTier } from '@/lib/perkTiers.js';
import { roboChimpUserFetch } from '@/lib/roboChimp.js';
import { type MinigameName, type MinigameScore, Minigames } from '@/lib/settings/minigames.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';
import type { DetailedFarmingContract } from '@/lib/skilling/skills/farming/utils/types.js';
import birdhouses, { type Birdhouse } from '@/lib/skilling/skills/hunter/birdHouseTrapping.js';
import type { SlayerTaskUnlocksEnum } from '@/lib/slayer/slayerUnlocks.js';
import { getUsersCurrentSlayerInfo, hasSlayerUnlock } from '@/lib/slayer/slayerUtil.js';
import type { SlayerSkipSettings } from '@/lib/slayer/types.js';
import type { ChargeBank } from '@/lib/structures/Bank.js';
import type { Gear } from '@/lib/structures/Gear.js';
import type { GearBank } from '@/lib/structures/GearBank.js';
import { MUserStats } from '@/lib/structures/MUserStats.js';
import type { XPBank } from '@/lib/structures/XPBank.js';
import type { XPCounter } from '@/lib/structures/XPCounter.js';
import type { SkillRequirements } from '@/lib/types/index.js';
import { BaseUser } from '@/lib/user/BaseUser.js';
import type { FullUserUpdateInput, SafeUserUpdateInput } from '@/lib/user/update.js';
import type { GearColumns, GearWithSetupType, HasDiaryDiaryKey } from '@/lib/user/userTypes.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { determineRunes } from '@/lib/util/determineRunes.js';
import { fetchUserStats } from '@/lib/util/fetchUserStats.js';
import { getKCByName } from '@/lib/util/getKCByName.js';
import { hasMonsterRequirements } from '@/lib/util/hasMonsterRequirements.js';
import { hasSkillReqsRaw } from '@/lib/util/smallUtils.js';
import { type TransactItemsArgs, transactItemsFromBank } from '@/lib/util/transactItemsFromBank.js';
import type { JsonKeys } from '@/lib/util.js';
import { getParsedStashUnits } from '@/mahoji/lib/abstracted_commands/stashUnitsCommand.js';

export class MUserClass extends BaseUser {
	constructor(user: User) {
		super(user);
	}

	getGearUpdateData(gearUpdates: GearWithSetupType[]) {
		const newGearData: Partial<Record<GearColumns, GearSetup | null>> = {};
		for (const { setup, gear } of gearUpdates) {
			const gearSetup: GearSetup = gear === null ? clone(defaultGearSetup) : gear;
			newGearData[`gear_${setup}`] = gearSetup;
		}
		return newGearData;
	}

	async updateGear(gearUpdates: GearWithSetupType[]) {
		const newGearData = this.getGearUpdateData(gearUpdates);
		await this.rawUpdate({
			data: newGearData
		});
	}

	countSkillsAtLeast99() {
		return Object.values(this.skillsAsLevels).filter(lvl => lvl >= 99).length;
	}

	async rawUpdate({
		data,
		gearUpdates
	}: {
		data: FullUserUpdateInput;
		gearUpdates?: GearWithSetupType[];
		_otherQueries?: any[];
	}): Promise<MUser> {
		const secondaryQueries = [];

		if ('collectionLogBank' in data && data.collectionLogBank) {
			secondaryQueries.push(
				prisma.jsonBank.upsert({
					where: {
						user_id_type: {
							user_id: this.id,
							type: 'CollectionLog'
						}
					},
					create: {
						user_id: this.id,
						type: 'CollectionLog',
						bank: data.collectionLogBank
					},
					update: {
						bank: data.collectionLogBank
					},
					select: { user_id: true }
				})
			);
		}

		if (gearUpdates && gearUpdates.length > 0) {
			const gearUpdateData = this.getGearUpdateData(gearUpdates);
			Object.assign(data, gearUpdateData);
		}

		const [newUser] = await prisma.$transaction([
			prisma.user.update({
				where: {
					id: this.id
				},
				data: {
					...(data as Prisma.UserUpdateInput)
				}
			}),
			...secondaryQueries
		]);
		this._updateRawUser(newUser);
		return this;
	}

	async update(arg: SafeUserUpdateInput): Promise<MUser> {
		return this.rawUpdate({ data: arg });
	}

	async setAttackStyle(newStyles: AttackStyles[]) {
		await this.update({
			attack_style: uniqueArr(newStyles)
		});
	}

	async calcMaxGearPresets() {
		return (await this.fetchPerkTier()) * 2 + 4;
	}

	async fetchPerkTier(): Promise<0 | PerkTier> {
		return getUsersPerkTier(this);
	}

	hasMonsterRequirements(monster: KillableMonster) {
		return hasMonsterRequirements(this, monster);
	}

	addXP(params: AddXpParams) {
		return addXP(this, params);
	}

	async getKC(monsterID: number): Promise<number> {
		if (!Number.isInteger(monsterID)) throw new Error('Invalid monsterID');
		const query = `
SELECT COALESCE((monster_scores->>'${monsterID}')::int, 0) AS monster_kc
FROM user_stats
WHERE user_id = ${this.id};`;
		const stats = await prisma.$queryRawUnsafe<{ monster_kc: number }[]>(query);
		return stats[0]?.monster_kc ?? 0;
	}

	async getAllKCs() {
		const rawKCs = (await this.fetchUserStat('monster_scores')) as ItemBank;
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

	async incrementKC(monsterID: number, quantityToAdd: number) {
		if (!Number.isInteger(monsterID)) throw new Error(`Invalid monsterID: ${monsterID}`);
		if (!Number.isInteger(quantityToAdd) || quantityToAdd < 1) {
			throw new Error(`Invalid quantityToAdd: ${quantityToAdd}`);
		}
		const query = `
UPDATE user_stats
SET monster_scores = add_item_to_bank(monster_scores, '${monsterID}', ${quantityToAdd})
WHERE user_id = ${this.id}
RETURNING (monster_scores->>'${monsterID}')::int AS new_kc;
`;
		const res = await prisma.$queryRawUnsafe<{ new_kc: number }[]>(query);
		return { newKC: res[0]?.new_kc ?? 0 };
	}

	public async addItemsToBank({
		items,
		collectionLog = false,
		filterLoot = true,
		dontAddToTempCL = false,
		neverUpdateHistory = false,
		otherUpdates
	}: {
		items: Bank;
		collectionLog?: boolean;
		filterLoot?: boolean;
		dontAddToTempCL?: boolean;
		neverUpdateHistory?: boolean;
		otherUpdates?: SafeUserUpdateInput;
	}) {
		return this.transactItems({
			collectionLog,
			itemsToAdd: items,
			filterLoot,
			dontAddToTempCL,
			neverUpdateHistory,
			otherUpdates
		});
	}

	async removeItemsFromBank(bankToRemove: Bank) {
		return this.transactItems({
			itemsToRemove: bankToRemove
		});
	}

	async transactItems(options: Omit<TransactItemsArgs, 'user'>) {
		const res = await transactItemsFromBank({ user: this, ...options });
		return res;
	}

	hasEquippedOrInBank(...args: Parameters<InstanceType<typeof GearBank>['hasEquippedOrInBank']>) {
		return this.gearBank.hasEquippedOrInBank(...args);
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

	async incrementMinigameScore(minigame: MinigameName, amountToAdd: number) {
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

	async minionIsBusy(): Promise<boolean> {
		const isBusy = await ActivityManager.minionIsBusy(this.id);
		return isBusy;
	}

	async getCreatureScore(creatureID: number): Promise<number> {
		if (!Number.isInteger(creatureID)) throw new Error('Invalid monsterID');
		const query = `
SELECT COALESCE((creature_scores->>'${creatureID}')::int, 0) AS creature_kc
FROM user_stats
WHERE user_id = ${this.id};`;
		const stats = await prisma.$queryRawUnsafe<{ creature_kc: number }[]>(query);
		return stats[0]?.creature_kc ?? 0;
	}

	async incrementCreatureScore(creatureID: number, quantityToAdd: number): Promise<{ newKC: number }> {
		if (!Number.isInteger(creatureID)) throw new Error('Invalid creatureID');
		if (!Number.isInteger(quantityToAdd) || quantityToAdd < 1) {
			throw new Error(`Tried to increment ${creatureID} creature score by invalid amount: ${quantityToAdd}`);
		}
		const query = `
UPDATE user_stats
SET creature_scores = add_item_to_bank(creature_scores, '${creatureID}', ${quantityToAdd})
WHERE user_id = ${this.id}
RETURNING (creature_scores->>'${creatureID}')::int AS new_kc;
`;
		const res = await prisma.$queryRawUnsafe<{ new_kc: number }[]>(query);
		return { newKC: res[0]?.new_kc ?? 0 };
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

Charge your items using ${globalClient.mentionCommand('minion', 'charge')}.`
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

	async addItemsToCollectionLog({
		itemsToAdd,
		otherUpdates
	}: {
		itemsToAdd: Bank;
		otherUpdates?: Omit<SafeUserUpdateInput, 'blowpipe'>;
	}) {
		const previousCL = this.cl.clone();

		const updates = this.calculateAddItemsToCLUpdates({
			items: itemsToAdd
		});
		await this.update({ ...updates, ...otherUpdates });
		await handleNewCLItems({ itemsAdded: itemsToAdd, user: this, newCL: this.cl, previousCL });
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
		const updates: SafeUserUpdateInput & { blowpipe?: IBlowpipeData } = {};

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
			const equippedAmmo = rangeGear.get('ammo')?.item;
			if (!equippedAmmo) {
				throw new UserError('No ammo equipped.');
			}
			if (equippedAmmo !== ammoRemove[0].id) {
				throw new UserError(
					`You have ${Items.itemNameFromId(equippedAmmo)} equipped as your range ammo, but you need: ${ammoRemove[0].name}.`
				);
			}
			const newRangeGear: GearSetup = this.gear[gearKey].raw();
			const ammo = newRangeGear.ammo?.quantity;

			const projectileCategory = Object.values(projectiles).find(i => i.items.includes(equippedAmmo));
			if (avasDevice && projectileCategory?.savedByAvas) {
				const ammoCopy = ammoRemove[1];
				for (let i = 0; i < ammoCopy; i++) {
					if (cryptoRng.percentChance(avasDevice.reduction)) {
						ammoRemove[1]--;
						realCost.remove(ammoRemove[0].id, 1);
					}
				}
			}
			if (!ammo || ammo < ammoRemove[1]) {
				throw new UserError(
					`Not enough ${ammoRemove[0].name} equipped in ${gearKey} gear, you need ${
						ammoRemove?.[1]
					} but you have only ${ammo}.`
				);
			}
			newRangeGear.ammo!.quantity -= ammoRemove?.[1];
			if (newRangeGear.ammo!.quantity <= 0) newRangeGear.ammo = null;
			const gearUpdateData = this.getGearUpdateData([
				{ setup: options?.isInWilderness ? 'wildy' : 'range', gear: newRangeGear }
			]);
			Object.assign(updates, gearUpdateData);
		}

		if (dart) {
			if (avasDevice) {
				const copyDarts = dart?.[1];
				for (let i = 0; i < copyDarts; i++) {
					if (cryptoRng.percentChance(avasDevice.reduction)) {
						realCost.remove(dart[0].id, 1);
						dart![1]--;
					}
				}
			}
			const scales = Math.ceil((10 / 3) * dart[1]);
			const rawBlowpipeData = this.getBlowpipe();
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
			const newBlowpipe = { ...this.getBlowpipe() };
			newBlowpipe.dartQuantity -= dart?.[1];
			newBlowpipe.scales -= scales;
			validateBlowpipeData(newBlowpipe);
			updates.blowpipe = newBlowpipe;
		}

		if (bankRemove.length > 0) {
			if (!this.bankWithGP.has(bankRemove)) {
				throw new UserError(`You don't own: ${bankRemove.clone().remove(this.bankWithGP)}.`);
			}
			await this.transactItems({ itemsToRemove: bankRemove });
		}
		await this.update(updates);
		return {
			realCost
		};
	}

	calculateAddItemsToCLUpdates({
		items,
		dontAddToTempCL = false
	}: {
		items: Bank;
		dontAddToTempCL?: boolean;
	}): Partial<Record<'temp_cl' | 'collectionLogBank', ItemBank>> {
		const updates: Partial<Record<'temp_cl' | 'collectionLogBank', ItemBank>> = {
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

	owns(checkBank: Bank | number | string, { includeGear }: { includeGear: boolean } = { includeGear: false }) {
		const allItems = this.bank.clone().add('Coins', Number(this.user.GP));
		if (includeGear) {
			for (const [item, qty] of this.allEquippedGearBank().items()) {
				allItems.add(item.id, qty);
			}
		}
		return allItems.has(checkBank);
	}

	async fetchStats(): Promise<UserStats> {
		return fetchUserStats(this.id);
	}

	async fetchMStats() {
		return new MUserStats(await this.fetchStats());
	}

	async getKCByName(name: string) {
		return getKCByName(this, name);
	}

	farmingInfo() {
		return Farming.getFarmingInfoFromUser(this);
	}

	farmingContract(): DetailedFarmingContract {
		const currentFarmingContract: IFarmingContract = this.fetchFarmingContract();
		const plant = !currentFarmingContract
			? undefined
			: Farming.Plants.find(i => i.name === currentFarmingContract?.plantToGrow);
		const farmingInfo = Farming.getFarmingInfoFromUser(this);
		return {
			contract: currentFarmingContract,
			plant,
			matchingPlantedCrop: plant
				? farmingInfo.patchesDetailed.find(i => i.plant && i.plant === plant)
				: undefined,
			farmingInfo
		};
	}

	generateGearImage({
		setupType,
		gearSetup
	}: {
		setupType?: GearSetupType | 'all';
		gearSetup?: Gear;
	}): Promise<Buffer> {
		const gearTemplate = this.user.gear_template ?? 0;
		if (setupType === 'all') {
			return generateAllGearImage({
				equippedPet: this.user.minion_equippedPet,
				bankBgHexColor: this.user.bank_bg_hex,
				iconPackId: this.iconPackId,
				farmingContract: this.farmingContract(),
				gear: this.gear,
				gearTemplate
			});
		}
		return generateGearImage({
			gearSetup: setupType ? this.gear[setupType] : gearSetup!,
			gearType: setupType,
			petID: this.user.minion_equippedPet,
			farmingContract: this.farmingContract(),
			gearTemplate
		});
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

	async addXPCounter({
		xpCounter,
		source,
		minimal
	}: {
		xpCounter: XPCounter;
		source?: XpGainSource;
		minimal?: boolean;
	}): Promise<string> {
		const results = [];
		for (const [skillName, amount] of xpCounter.entries()) {
			results.push(await this.addXP({ skillName, amount, source, minimal }));
		}
		return results.join(' ');
	}

	async addXPBank(xpBank: XPBank) {
		const results = [];
		for (const options of xpBank.xpList) {
			results.push(await this.addXP(options));
		}
		return results.join(' ');
	}

	async checkBankBackground() {
		if (this.isModOrAdmin()) {
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
		if (background.perkTierNeeded && (await this.fetchPerkTier()) >= background.perkTierNeeded) {
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
			[`gear_${setup}`]: gear
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

	public hasDiary(key: HasDiaryDiaryKey): boolean {
		return this.user.completed_achievement_diaries.includes(key);
	}

	hasGracefulEquipped(): boolean {
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

	async statsUpdate(data: Omit<Prisma.UserStatsUpdateInput, 'user_id'>): Promise<void> {
		const id = BigInt(this.id);
		// TODO: Extra-safe check for now
		const count = await prisma.userStats.count({
			where: {
				user_id: id
			}
		});
		if (count === 0) {
			await prisma.userStats.upsert({
				where: {
					user_id: id
				},
				create: {
					user_id: id
				},
				update: {}
			});
		}

		await prisma.userStats.update({
			data,
			where: {
				user_id: id
			},
			select: {
				user_id: true
			}
		});
	}

	async statsBankUpdate(key: JsonKeys<UserStats>, bank: Bank): Promise<void> {
		if (!key) throw new Error('No key provided to userStatsBankUpdate');
		const currentItemBank = ((await this.fetchUserStat(key)) ?? {}) as ItemBank;
		if (!isObject(currentItemBank)) {
			throw new Error(`Key ${key} is not an object.`);
		}
		await this.statsUpdate({
			[key]: bank.clone().add(currentItemBank).toJSON()
		});
	}

	async updateGPTrackSetting(setting: 'gp_dice' | 'gp_luckypick' | 'gp_slots', amount: number) {
		await this.statsUpdate({
			[setting]: {
				increment: amount
			}
		});
	}

	async calcMaxTripLength(activity: activity_type_enum): Promise<number> {
		return calcMaxTripLength(this, activity);
	}

	async addMonsterXP(params: AddMonsterXpParams) {
		const res = addMonsterXPRaw({ ...params, attackStyles: this.getAttackStyles(), rng: cryptoRng });
		const result = await this.addXPBank(res);
		return `**XP Gains:** ${result}`;
	}

	async fetchSlayerInfo() {
		const res = await getUsersCurrentSlayerInfo(this.id);
		return res;
	}

	getSlayerSkipSettings(): SlayerSkipSettings {
		const rawSettings = this.user.slayer_skip_settings ?? {};
		if (!isObject(rawSettings)) return {};
		const parsedEntries = Object.entries(rawSettings).map(([masterKey, monsterIDs]) => {
			if (!Array.isArray(monsterIDs)) return [masterKey, []];
			const filtered = monsterIDs.filter(id => typeof id === 'number');
			return [masterKey, filtered];
		});
		return Object.fromEntries(parsedEntries);
	}

	async updateSlayerSkipSettings(masterKey: string, monsterIDs: number[]) {
		const currentSettings = this.getSlayerSkipSettings();
		const newSettings = { ...currentSettings, [masterKey]: monsterIDs };
		await this.update({ slayer_skip_settings: newSettings });
		return newSettings;
	}

	async setSlayerAutoSkipBuffer(amount: number) {
		await this.update({ slayer_auto_skip_buffer: amount });
	}

	hasSlayerUnlock(unlock: SlayerTaskUnlocksEnum): boolean {
		return this.user.slayer_unlocks.includes(unlock);
	}

	checkHasSlayerUnlocks(unlocks: SlayerTaskUnlocksEnum[]) {
		return hasSlayerUnlock(this.user.slayer_unlocks, unlocks);
	}

	public calculateUsableFood(params: Omit<GetUserFoodFromBankParams, 'gearBank'>) {
		return getUserFoodFromBank({ ...params, gearBank: this.gearBank });
	}

	async removeFoodFromUser(params: Omit<RemoveFoodFromUserParams, 'user'>) {
		return removeFoodFromUser({ ...params, user: this });
	}

	async fetchCL(): Promise<Bank> {
		const cl = await prisma.jsonBank.findUnique({
			where: {
				user_id_type: {
					user_id: this.id,
					type: 'CollectionLog'
				}
			}
		});

		if (!cl) return new Bank();
		return new Bank(cl.bank as ItemBank);
	}

	async fetchUserStat<K extends keyof UserStats>(key: K): Promise<UserStats[K]> {
		const userStats = (await prisma.userStats.findFirstOrThrow({
			where: { user_id: BigInt(this.id) },
			select: { [key]: true }
		})) as unknown as Pick<UserStats, K>;
		return userStats[key];
	}

	async syncCompletedAchievementDiaries(preFetchedData?: { stats: MUserStats; minigameScores: Minigame }) {
		const [stats, minigameScores] = preFetchedData
			? [preFetchedData.stats, preFetchedData.minigameScores]
			: await Promise.all([this.fetchMStats(), this.fetchMinigames()]);
		const completedKeys: string[] = [];
		for (const diary of diaries) {
			for (const tier of ['easy', 'medium', 'hard', 'elite'] as const) {
				const key = `${diary.name}.${tier}`.replace(/\s/g, '').toLowerCase();
				const { hasDiary } = userhasDiaryTierSync(this, diary[tier], { stats, minigameScores });
				if (hasDiary) {
					completedKeys.push(key);
				}
			}
		}
		await this.update({
			completed_achievement_diaries: completedKeys
		});
	}

	async giveBotMessagePet(petToGive: Pet) {
		const user = await prisma.user.findUniqueOrThrow({
			where: { id: this.id },
			select: {
				id: true,
				pets: true
			}
		});

		const userPets = user.pets as ItemBank;
		const newUserPets = { ...userPets };
		if (!newUserPets[petToGive.id]) newUserPets[petToGive.id] = 1;
		else newUserPets[petToGive.id]++;
		await prisma.user.update({
			where: { id: this.id },
			data: {
				pets: newUserPets
			}
		});
		return {
			isNewPet: !userPets[petToGive.id]
		};
	}

	async updateBlowpipe(newBlowpipe: IBlowpipeData): Promise<void> {
		await this.rawUpdate({
			data: {
				blowpipe: ZBlowpipeData.parse(newBlowpipe)
			}
		});
	}

	async updateFarmingContract(newContract: IFarmingContract): Promise<void> {
		await this.rawUpdate({
			data: {
				minion_farmingContract: ZFarmingContract.parse(newContract)
			}
		});
	}

	fetchFarmingContract(): IFarmingContract {
		return ZFarmingContract.parse(this.user.minion_farmingContract ?? Farming.defaultFarmingContract);
	}

	async updateBirdhouseData(newData: IBirdhouseData): Promise<void> {
		await this.rawUpdate({
			data: {
				minion_birdhouseTraps: ZBirdhouseData.parse(newData)
			}
		});
	}

	fetchBirdhouseData(): IBirdhouseData & {
		isReady: boolean;
		readyIn: number;
		birdhouse: Birdhouse | null;
		readyAt: Date | null;
	} {
		const rawBirdhouse = ZBirdhouseData.parse(
			this.user.minion_birdhouseTraps ?? {
				lastPlaced: null,
				birdhousePlaced: false,
				birdhouseTime: 0
			}
		);
		if (!rawBirdhouse.birdhousePlaced) {
			return {
				...rawBirdhouse,
				isReady: false,
				readyIn: -1,
				birdhouse: null,
				readyAt: null
			};
		}
		const birdhouse = birdhouses.find(b => {
			if (typeof rawBirdhouse.lastPlaced === 'string') {
				return b.name === rawBirdhouse.lastPlaced;
			}
			return b.birdhouseItem === rawBirdhouse.lastPlaced;
		})!;
		const lastPlacedTime: number = rawBirdhouse.birdhouseTime;
		const difference = Date.now() - lastPlacedTime;
		const isReady = difference > birdhouse.waitTime;
		const readyAtTimestamp = lastPlacedTime + birdhouse.waitTime;
		const readyIn = readyAtTimestamp - Date.now();
		const readyAt = new Date(readyAtTimestamp);
		return {
			...rawBirdhouse,
			isReady,
			readyIn,
			birdhouse,
			readyAt
		};
	}

	async isBlacklisted(): Promise<boolean> {
		return Cache.isUserBlacklisted(this.id);
	}

	private getMutex(): Mutex {
		const cached = MUTEX_CACHE.get(this.id);
		if (cached) return cached;
		const mutex = new Mutex();
		MUTEX_CACHE.set(this.id, mutex);
		return mutex;
	}

	async withLock<T>(id: string, fn: (user: MUserClass) => Promise<T>, timeoutMs = 60_000): Promise<T> {
		const mutex = this.getMutex();
		let timer: NodeJS.Timeout | undefined;

		const timeoutPromise = new Promise<never>((_, reject) => {
			timer = setTimeout(() => reject(new Error(`${id} held lock for over 60s`)), timeoutMs);
		});

		const res = await Promise.race([
			mutex.runExclusive(async () => {
				await this.sync();
				return fn(this);
			}),
			timeoutPromise
		]);

		if (timer) clearTimeout(timer);
		return res as T;
	}
}

export async function srcMUserFetch(userID: string, updates?: Prisma.UserUpdateInput) {
	if (!isValidDiscordSnowflake(userID)) {
		throw new Error(`Invalid userID: ${userID}`);
	}
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

export type { SafeUserUpdateInput };
