import { randInt, roll } from '@oldschoolgg/rng';
import type { IFarmingContract } from '@oldschoolgg/schemas';
import { Emoji, Events } from '@oldschoolgg/toolkit';
import { Bank, itemID, Monsters } from 'oldschooljs';

import type { CropUpgradeType } from '@/prisma/main/enums.js';
import chatHeadImage from '@/lib/canvas/chatHeadImage.js';
import { combatAchievementTripEffect } from '@/lib/combat_achievements/combatAchievements.js';
import { BitField } from '@/lib/constants.js';
import { Farming, type PatchTypes } from '@/lib/skilling/skills/farming/index.js';
import { getFarmingKeyFromName } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type { FarmingActivityTaskOptions, MonsterActivityTaskOptions } from '@/lib/types/minions.js';
import { assert } from '@/lib/util/logError.js';
import { skillingPetDropRate } from '@/lib/util.js';

export type FarmingStepAttachment = Awaited<ReturnType<typeof chatHeadImage>>;

type FarmingStepXPMessageSkill = 'farming' | 'woodcutting' | 'herblore';

export interface FarmingStepXPBreakdown {
	planting: number;
	harvest: number;
	checkHealth: number;
	rake: number;
	bonus: number;
	totalFarming: number;
	woodcutting: number;
	herblore: number;
}

export interface FarmingStepSummary {
	planted?: { itemName: string; quantity: number };
	harvested?: { itemName: string; quantity: number; alive: number; died: number };
	reminder?: string;
	payNote?: string;
	duration: number;
	xp: FarmingStepXPBreakdown;
	xpMessages: Partial<Record<FarmingStepXPMessageSkill, string>>;
	boosts?: string[];
	contractCompleted?: boolean;
}

export interface FarmingStepResult {
	message: string;
	loot: Bank | null;
	attachment?: FarmingStepAttachment;
	summary?: FarmingStepSummary;
}

interface ExecuteFarmingStepOptions {
	user: MUser;
	channelID: string;
	data: FarmingActivityTaskOptions;
}

type FarmingPlant = (typeof Farming.Plants)[number];

interface PlantingOnlyOptions {
	user: MUser;
	plant: FarmingPlant;
	quantity: number;
	upgradeType: CropUpgradeType | null;
	payment: FarmingActivityTaskOptions['payment'];
	duration: number;
	compostXp: number;
	bonusXpMultiplier: number;
	ensurePid: () => Promise<void>;
	currentDate: number;
	plantingPid: { value: number | null };
	seedType: FarmingPlant['seedType'];
}

interface PatchSurvivalModifiers {
	lives: number;
	chanceOfDeathReduction: number;
}

interface HarvestLootResult {
	loot: Bank;
	harvestXp: number;
	herbloreXp: number;
	cropYield: number;
	rakeXp: number;
}

function getCompostXp(upgradeType: CropUpgradeType | null): number {
	if (upgradeType === 'compost') return 18;
	if (upgradeType === 'supercompost') return 26;
	if (upgradeType === 'ultracompost') return 36;
	return 0;
}

function calculateEquipmentModifiers(user: MUser): {
	baseBonus: number;
	bonusXpMultiplier: number;
	boosts: string[];
} {
	let baseBonus = 1;
	let bonusXpMultiplier = 0;
	let farmersPiecesCheck = 0;
	let farmersBonusPercent = 0;
	const boosts: string[] = [];

	if (user.hasEquippedOrInBank('Magic secateurs')) {
		baseBonus += 0.1;
		boosts.push('Magic secateurs: +10% crop yield');
	}

	if (user.hasEquippedOrInBank('Farming cape')) {
		baseBonus += 0.05;
		boosts.push('Farming cape: +5% crop yield');
	}

	const addFarmersBonus = (bonus: number, countPiece = true) => {
		bonusXpMultiplier += bonus;
		farmersBonusPercent += bonus * 100;
		if (countPiece) {
			farmersPiecesCheck += 1;
		}
	};

	if (user.hasEquippedOrInBank("Farmer's strawhat")) {
		addFarmersBonus(0.004);
	}
	if (user.hasEquippedOrInBank("Farmer's jacket") || user.hasEquippedOrInBank("Farmer's shirt")) {
		addFarmersBonus(0.008);
	}
	if (user.hasEquippedOrInBank("Farmer's boro trousers")) {
		addFarmersBonus(0.006);
	}
	if (user.hasEquippedOrInBank("Farmer's boots")) {
		addFarmersBonus(0.002);
	}
	if (farmersPiecesCheck === 4) {
		addFarmersBonus(0.005, false);
	}

	if (farmersBonusPercent > 0) {
		const formattedBonus = Number.isInteger(farmersBonusPercent)
			? farmersBonusPercent.toString()
			: farmersBonusPercent.toFixed(1).replace(/\.0$/, '');
		boosts.push(`Farmer's outfit: +${formattedBonus}% bonus XP`);
	}

	return { baseBonus, bonusXpMultiplier, boosts };
}

function calculatePatchSurvivalModifiers(patchType: PatchTypes.IPatchData): PatchSurvivalModifiers {
	let lives = 3;
	let chanceOfDeathReduction = 1;

	if (patchType.lastUpgradeType === 'compost') {
		lives += 1;
		chanceOfDeathReduction = 1 / 2;
	} else if (patchType.lastUpgradeType === 'supercompost') {
		lives += 2;
		chanceOfDeathReduction = 1 / 5;
	} else if (patchType.lastUpgradeType === 'ultracompost') {
		lives += 3;
		chanceOfDeathReduction = 1 / 10;
	}

	if (patchType.lastPayment) chanceOfDeathReduction = 0;

	return { lives, chanceOfDeathReduction };
}

async function handlePlantingOnlyStep(options: PlantingOnlyOptions): Promise<FarmingStepResult> {
	const {
		user,
		plant,
		quantity,
		upgradeType,
		payment,
		duration,
		compostXp,
		bonusXpMultiplier,
		ensurePid,
		currentDate,
		plantingPid,
		seedType
	} = options;

	const loot = new Bank();
	const rakeXp = quantity * 4 * 3;
	const plantXp = quantity * (plant.plantXp + compostXp);
	const farmingXpReceived = plantXp + rakeXp;

	loot.add('Weeds', quantity * 3);

	let message = `${user}, ${user.minionName} finished raking ${quantity} patches and planting ${quantity}x ${
		plant.name
	}.\n\nYou received ${plantXp.toLocaleString()} XP from planting and ${rakeXp.toLocaleString()} XP from raking for a total of ${farmingXpReceived.toLocaleString()} Farming XP.`;

	const bonusXP = Math.floor(farmingXpReceived * bonusXpMultiplier);
	if (bonusXP > 0) {
		message += ` You received an additional ${bonusXP.toLocaleString()} in bonus XP.`;
	}

	const farmingXPAmount = Math.floor(farmingXpReceived + bonusXP);
	const farmingXPResult = await user.addXP({
		skillName: 'farming',
		amount: farmingXPAmount,
		duration
	});
	if (farmingXPResult.length > 0) {
		message += `\n${farmingXPResult}`;
	}

	if (loot.length > 0) {
		message += `\n\nYou received: ${loot}.`;
	}

	await ClientSettings.updateBankSetting('farming_loot_bank', loot);
	await user.transactItems({
		collectionLog: true,
		itemsToAdd: loot
	});

	await ensurePid();

	const newPatch: PatchTypes.PatchData = {
		lastPlanted: plant.name,
		patchPlanted: true,
		plantTime: currentDate,
		lastQuantity: quantity,
		lastUpgradeType: upgradeType,
		lastPayment: payment ?? false,
		pid: plantingPid.value ?? undefined
	};

	await user.update({
		[getFarmingKeyFromName(seedType)]: newPatch
	});

	const reminder = `${user.minionName} tells you to come back after your plants have finished growing!`;
	message += `\n\n${reminder}`;

	const summary: FarmingStepSummary = {
		planted: { itemName: plant.name, quantity },
		reminder,
		xp: {
			planting: plantXp,
			harvest: 0,
			checkHealth: 0,
			rake: rakeXp,
			bonus: bonusXP,
			totalFarming: farmingXPAmount,
			woodcutting: 0,
			herblore: 0
		},
		duration,
		xpMessages: farmingXPResult.length > 0 ? { farming: farmingXPResult } : {}
	};

	return { message, loot: loot.length > 0 ? loot : null, summary };
}

function calculateAlivePlants(
	plantToHarvest: FarmingPlant,
	patchType: PatchTypes.IPatchData,
	survivalModifiers: PatchSurvivalModifiers
): number {
	let quantityDead = 0;
	for (let i = 0; i < patchType.lastQuantity; i++) {
		for (let j = 0; j < plantToHarvest.numOfStages - 1; j++) {
			const deathRoll = Math.random();
			const scaled = Math.floor(plantToHarvest.chanceOfDeath * survivalModifiers.chanceOfDeathReduction);
			const rollThreshold = scaled / 128;
			if (deathRoll < rollThreshold) {
				quantityDead++;
				break;
			}
		}
	}

	return patchType.lastQuantity - quantityDead;
}

async function calculateHarvestLoot(options: {
	user: MUser;
	plantToHarvest: FarmingPlant;
	patchType: PatchTypes.IPatchData;
	quantity: number;
	alivePlants: number;
	baseBonus: number;
	currentFarmingLevel: number;
	survivalModifiers: PatchSurvivalModifiers;
}): Promise<HarvestLootResult | null> {
	const {
		user,
		plantToHarvest,
		patchType,
		quantity,
		alivePlants,
		baseBonus,
		currentFarmingLevel,
		survivalModifiers
	} = options;
	const loot = new Bank();
	let harvestXp = 0;
	let herbloreXp = 0;
	let cropYield = 0;
	let rakeXp = 0;

	const shouldCleanHerb =
		plantToHarvest.herbXp !== undefined &&
		user.bitfield.includes(BitField.CleanHerbsFarming) &&
		user.skillsAsLevels.herblore >= plantToHarvest.herbLvl!;

	if (!plantToHarvest.givesCrops) {
		return { loot, harvestXp, herbloreXp, cropYield, rakeXp };
	}

	let cropToHarvest = plantToHarvest.outputCrop;
	if (shouldCleanHerb) {
		cropToHarvest = plantToHarvest.cleanHerbCrop;
	}
	if (plantToHarvest.variableYield) {
		cropYield = Farming.calcVariableYield(
			plantToHarvest,
			patchType.lastUpgradeType,
			currentFarmingLevel,
			alivePlants
		);
	} else if (plantToHarvest.fixedOutput) {
		if (!plantToHarvest.fixedOutputAmount) return null;
		cropYield = plantToHarvest.fixedOutputAmount * alivePlants;
	} else {
		let lives = survivalModifiers.lives;
		const plantChanceFactor =
			Math.floor(
				Math.floor(
					plantToHarvest.chance1 +
						(plantToHarvest.chance99 - plantToHarvest.chance1) * ((user.skillsAsLevels.farming - 1) / 98)
				) * baseBonus
			) + 1;
		const chanceToSaveLife = (plantChanceFactor + 1) / 256;
		if (plantToHarvest.seedType === 'bush') lives = 4;
		cropYield = 0;
		const livesHolder = lives;
		for (let k = 0; k < alivePlants; k++) {
			lives = livesHolder;
			for (let _n = 0; lives > 0; _n++) {
				if (Math.random() > chanceToSaveLife) {
					lives -= 1;
					cropYield += 1;
				} else {
					cropYield += 1;
				}
			}
		}
	}

	loot.add(cropToHarvest, cropYield);
	if (quantity > patchType.lastQuantity) {
		const additionalPatches = quantity - patchType.lastQuantity;
		loot.add('Weeds', additionalPatches * 3);
		rakeXp += additionalPatches * 12;
	}

	if (shouldCleanHerb && plantToHarvest.herbXp) {
		herbloreXp = cropYield * plantToHarvest.herbXp;
		const uncleanedHerbLoot = new Bank().add(plantToHarvest.outputCrop, cropYield);
		await user.addItemsToCollectionLog({ itemsToAdd: uncleanedHerbLoot });
		const cleanedHerbLoot = new Bank().add(plantToHarvest.cleanHerbCrop, cropYield);
		await user.statsBankUpdate('herbs_cleaned_while_farming_bank', cleanedHerbLoot);
	}

	if (plantToHarvest.name === 'Limpwurt') {
		harvestXp = plantToHarvest.harvestXp * alivePlants;
	} else {
		harvestXp = cropYield * plantToHarvest.harvestXp;
	}

	return { loot, harvestXp, herbloreXp, cropYield, rakeXp };
}

interface TreeRemovalResult {
	chopped: boolean;
	payStr: string;
	harvestXpReset: boolean;
}

async function handleTreeRemoval(options: {
	user: MUser;
	plantToHarvest: FarmingPlant;
	alivePlants: number;
	currentWoodcuttingLevel: number;
	channelID: string;
	data: FarmingActivityTaskOptions;
}): Promise<TreeRemovalResult | null> {
	const { user, plantToHarvest, alivePlants, currentWoodcuttingLevel, channelID, data } = options;

	if (!plantToHarvest.needsChopForHarvest) {
		return { chopped: false, payStr: '', harvestXpReset: false };
	}

	if (!plantToHarvest.treeWoodcuttingLevel) {
		return null;
	}

	if (currentWoodcuttingLevel >= plantToHarvest.treeWoodcuttingLevel) {
		return { chopped: true, payStr: '', harvestXpReset: false };
	}

	const GP = Number(user.user.GP);
	const gpToCutTree = plantToHarvest.seedType === 'redwood' ? 2000 * alivePlants : 200 * alivePlants;
	const prePaid = data.treeChopFeePaid ?? 0;
	const plannedFee = data.treeChopFeePlanned ?? (prePaid > 0 ? prePaid : 0);
	const coinsOwedNow = Math.max(0, gpToCutTree - prePaid);

	if (GP < coinsOwedNow) {
		try {
			if (await globalClient.channelIsSendable(channelID)) {
				await globalClient.sendMessage(channelID, {
					content: `You do not have the required woodcutting level or enough GP to clear your patches, in order to be able to plant more. You still need ${coinsOwedNow} GP.`
				});
			}
		} catch (err) {
			Logging.logError(err as Error, { channel_id: channelID, type: 'send_to_channel_id' });
		}
		return null;
	}

	let payStr = '';
	if (coinsOwedNow > 0) {
		await user.removeItemsFromBank(new Bank().add('Coins', coinsOwedNow));
		const savings = plannedFee > gpToCutTree ? plannedFee - gpToCutTree : 0;
		const paymentMessage = `You did not have the woodcutting level required, so you paid a nearby farmer ${coinsOwedNow.toLocaleString()} GP to remove the previous trees.`;
		payStr =
			savings > 0
				? `*${paymentMessage} This was ${savings.toLocaleString()} GP less than you initially expected to pay.*`
				: `*${paymentMessage}*`;
	} else {
		const refund = Math.max(0, prePaid - gpToCutTree);
		if (refund > 0) {
			await user.addItemsToBank({ items: new Bank().add('Coins', refund) });
			payStr = `*You had prepaid ${prePaid.toLocaleString()} GP to remove the previous trees, but only ${gpToCutTree.toLocaleString()} GP was needed, so ${refund.toLocaleString()} GP was refunded to you.*`;
		} else if (gpToCutTree > 0) {
			payStr = `*You had already paid a nearby farmer ${Math.min(prePaid, gpToCutTree).toLocaleString()} GP to remove the previous trees.*`;
		} else if (plannedFee > 0) {
			payStr = `*No payment was needed to remove the previous trees.*`;
		}
	}

	return { chopped: false, payStr, harvestXpReset: true };
}

function calculateWoodcuttingOutcome(options: {
	plantToHarvest: FarmingPlant;
	alivePlants: number;
	chopped: boolean;
}): { woodcuttingXp: number; woodcuttingLoot: Bank; woodcuttingOccurred: boolean } {
	const { plantToHarvest, alivePlants, chopped } = options;

	if (!chopped || !plantToHarvest.givesLogs) {
		return { woodcuttingXp: 0, woodcuttingLoot: new Bank(), woodcuttingOccurred: false };
	}

	const logItemID = typeof plantToHarvest.outputLogs === 'number' ? plantToHarvest.outputLogs : itemID('Logs');
	const xpPerLog = typeof plantToHarvest.woodcuttingXp === 'number' ? plantToHarvest.woodcuttingXp : null;
	const logsPerTreeCap =
		typeof plantToHarvest.outputLogsQuantity === 'number' ? plantToHarvest.outputLogsQuantity : null;
	const depletionChance =
		typeof plantToHarvest.logDepletionChance === 'number' ? plantToHarvest.logDepletionChance : 1 / 8;

	if (!xpPerLog || !logsPerTreeCap || logsPerTreeCap <= 0) {
		return { woodcuttingXp: 0, woodcuttingLoot: new Bank(), woodcuttingOccurred: false };
	}

	let totalLogs = 0;
	const cappedLogsPerTree = Math.max(1, logsPerTreeCap);

	for (let treeIndex = 0; treeIndex < alivePlants; treeIndex++) {
		let logsFromTree = 0;
		while (logsFromTree < cappedLogsPerTree) {
			logsFromTree += 1;
			if (Math.random() < depletionChance) {
				break;
			}
		}
		totalLogs += logsFromTree;
	}

	if (totalLogs <= 0) {
		return { woodcuttingXp: 0, woodcuttingLoot: new Bank(), woodcuttingOccurred: false };
	}

	const woodcuttingLoot = new Bank().add(logItemID, totalLogs);
	if (plantToHarvest.outputRoots) {
		let totalRoots = 0;
		for (let treeIndex = 0; treeIndex < alivePlants; treeIndex++) {
			totalRoots += randInt(1, 4);
		}
		if (totalRoots > 0) {
			woodcuttingLoot.add(plantToHarvest.outputRoots, totalRoots);
		}
	}
	const woodcuttingXp = totalLogs * xpPerLog;

	return { woodcuttingXp, woodcuttingLoot, woodcuttingOccurred: true };
}

export async function executeFarmingStep({
	user,
	channelID,
	data
}: ExecuteFarmingStepOptions): Promise<FarmingStepResult | null> {
	const { plantsName, patchType, quantity, upgradeType, payment, planting, currentDate } = data;

	if (!patchType) {
		throw new Error('Missing patch data for farming step');
	}

	const plant = Farming.Plants.find(plantItem => plantItem.name === plantsName)!;
	assert(Boolean(plant));

	const { baseBonus, bonusXpMultiplier, boosts } = calculateEquipmentModifiers(user);
	const compostXp = getCompostXp(upgradeType ?? null);
	const survivalModifiers = calculatePatchSurvivalModifiers(patchType);
	const currentFarmingLevel = user.skillsAsLevels.farming;
	const currentWoodcuttingLevel = user.skillsAsLevels.woodcutting;
	const harvestedPid = patchType.pid ?? null;
	const plantingPid = { value: data.pid ?? null };

	const ensurePid = async () => {
		if (plantingPid.value || !planting) {
			return;
		}
		const inserted = await prisma.farmedCrop.create({
			data: {
				user_id: user.id,
				date_planted: new Date(currentDate),
				item_id: plant.id,
				quantity_planted: quantity,
				was_autofarmed: data.autoFarmed,
				paid_for_protection: payment ?? false,
				upgrade_type: upgradeType
			}
		});
		plantingPid.value = inserted.id;
	};

	if (!patchType.patchPlanted) {
		return handlePlantingOnlyStep({
			user,
			plant,
			quantity,
			upgradeType: upgradeType ?? null,
			payment,
			duration: data.duration,
			compostXp,
			bonusXpMultiplier,
			ensurePid,
			currentDate,
			plantingPid,
			seedType: plant.seedType
		});
	}

	const plantToHarvest = Farming.Plants.find(plantItem => plantItem.name === patchType.lastPlanted)!;
	assert(Boolean(plantToHarvest));

	const alivePlants = calculateAlivePlants(plantToHarvest, patchType, survivalModifiers);
	const plantingStr = planting ? `Your minion planted ${quantity}x ${plant.name}. ` : '';
	const plantXp = planting ? quantity * (plant.plantXp + compostXp) : 0;
	const checkHealthXp = alivePlants * plantToHarvest.checkXp;

	const harvestLootResult = await calculateHarvestLoot({
		user,
		plantToHarvest,
		patchType,
		quantity,
		alivePlants,
		baseBonus,
		currentFarmingLevel,
		survivalModifiers
	});
	if (!harvestLootResult) {
		return null;
	}
	let { loot, harvestXp, herbloreXp, rakeXp } = harvestLootResult;

	const treeRemovalResult = await handleTreeRemoval({
		user,
		plantToHarvest,
		alivePlants,
		currentWoodcuttingLevel,
		channelID,
		data
	});
	if (!treeRemovalResult) {
		return null;
	}
	const { chopped, payStr, harvestXpReset } = treeRemovalResult;
	if (harvestXpReset) {
		harvestXp = 0;
	}

	const woodcuttingOutcome = calculateWoodcuttingOutcome({ plantToHarvest, alivePlants, chopped });
	if (woodcuttingOutcome.woodcuttingOccurred) {
		loot.add(woodcuttingOutcome.woodcuttingLoot);
	}
	const woodcuttingXp = woodcuttingOutcome.woodcuttingXp;
	const bonusXP = Math.floor((plantXp + harvestXp + checkHealthXp + rakeXp) * bonusXpMultiplier);
	const farmingXPAmount = Math.floor(plantXp + harvestXp + checkHealthXp + rakeXp + bonusXP);
	const woodcuttingXPAmount = Math.floor(woodcuttingXp);

	const xpRes = await user.addXP({
		skillName: 'farming',
		duration: data.duration,
		amount: farmingXPAmount
	});
	const wcXP = await user.addXP({
		skillName: 'woodcutting',
		amount: woodcuttingXPAmount
	});
	await user.addXP({
		skillName: 'herblore',
		amount: Math.floor(herbloreXp),
		source: 'CleaningHerbsWhileFarming'
	});

	const xpMessages: Partial<Record<FarmingStepXPMessageSkill, string>> = {};
	if (xpRes.length > 0) {
		xpMessages.farming = xpRes;
	}
	if (wcXP.length > 0) {
		xpMessages.woodcutting = wcXP;
	}

	const infoStr: string[] = [];
	const xpBreakdownParts = [
		`${plantXp.toLocaleString()} XP for planting`,
		`${harvestXp.toLocaleString()} XP for harvesting`,
		`${checkHealthXp.toLocaleString()} XP for checking health`
	];
	if (rakeXp > 0) {
		xpBreakdownParts.push(`${rakeXp.toLocaleString()} XP from raking new patches`);
	}
	const xpBreakdown =
		xpBreakdownParts.length > 1
			? xpBreakdownParts.join(', ').replace(/, ([^,]*)$/, ', and $1')
			: xpBreakdownParts[0];
	infoStr.push(
		`${plantingStr}harvesting ${patchType.lastQuantity}x ${plantToHarvest.name}.${payStr}\n\nYou received ${xpBreakdown}. In total: ${xpRes}. ${
			woodcuttingOutcome.woodcuttingOccurred ? wcXP : ''
		}`
	);

	if (bonusXP > 0) {
		infoStr.push(`\nYou received an additional ${bonusXP.toLocaleString()} bonus XP from your farmer's outfit.`);
	}

	if (herbloreXp > 0) {
		infoStr.push(
			`\nYou received ${herbloreXp.toLocaleString()} Herblore XP for cleaning the herbs during your trip.`
		);
	}

	if (boosts.length > 0) {
		infoStr.push(`\n**Boosts:** ${boosts.join(', ')}.`);
	}

	const { petDropRate } = skillingPetDropRate(user, 'farming', plantToHarvest.petChance);
	if (plantToHarvest.seedType === 'hespori') {
		// PGLite/local env can lack the PG helper used inside incrementKC, so don't let it kill the trip
		try {
			await user.incrementKC(Monsters.Hespori.id, patchType.lastQuantity);
		} catch (err) {
			console.warn(
				`Failed to increment Hespori KC for user ${user.id} (likely missing PG function in local DB):`,
				err
			);
		}

		const hesporiLoot = Monsters.Hespori.kill(patchType.lastQuantity, {
			farmingLevel: currentFarmingLevel
		});

		const fakeMonsterTaskOptions: MonsterActivityTaskOptions = {
			mi: Monsters.Hespori.id,
			q: patchType.lastQuantity,
			type: 'MonsterKilling',
			userID: user.id,
			duration: data.duration,
			finishDate: data.finishDate,
			channelId: channelID,
			id: data.id
		};

		await combatAchievementTripEffect({ user, messages: infoStr, data: fakeMonsterTaskOptions });

		// hespori farming replaces loot with monster loot
		loot = hesporiLoot;
	} else if (
		patchType.patchPlanted &&
		plantToHarvest.petChance &&
		alivePlants > 0 &&
		roll(petDropRate / alivePlants)
	) {
		loot.add('Tangleroot');
	}

	if (plantToHarvest.seedType === 'seaweed' && roll(3)) {
		loot.add('Seaweed spore', randInt(1, 3));
	}

	// only non-hespori runs can roll hespori seeds
	if (plantToHarvest.seedType !== 'hespori') {
		let hesporiSeeds = 0;
		for (let i = 0; i < alivePlants; i++) {
			if (roll(plantToHarvest.petChance / 500)) {
				hesporiSeeds++;
			}
		}
		if (hesporiSeeds > 0) {
			loot.add('Hespori seed', hesporiSeeds);
		}
	}

	if (loot.has('Tangleroot')) {
		globalClient.emit(
			Events.ServerNotification,
			`${Emoji.Farming} **${user.badgedUsername}'s** minion, ${user.minionName}, just received a Tangleroot while farming ${patchType.lastPlanted} at level ${currentFarmingLevel} Farming!`
		);
	}

	let newPatch: PatchTypes.PatchData = {
		lastPlanted: null,
		patchPlanted: false,
		plantTime: 0,
		lastQuantity: 0,
		lastUpgradeType: null,
		lastPayment: false
	};

	if (planting) {
		await ensurePid();
		newPatch = {
			lastPlanted: plant.name,
			patchPlanted: true,
			plantTime: currentDate,
			lastQuantity: quantity,
			lastUpgradeType: upgradeType ?? null,
			lastPayment: payment ?? false,
			pid: plantingPid.value ?? undefined
		};
	}

	await user.update({
		[getFarmingKeyFromName(plant.seedType)]: newPatch
	});

	const { contract: currentContract } = user.farmingContract();
	const { contractsCompleted } = currentContract;

	let janeMessage = false;
	if (currentContract.hasContract && plantToHarvest.name === currentContract.plantToGrow && alivePlants > 0) {
		const farmingContractUpdate: IFarmingContract = {
			hasContract: false,
			difficultyLevel: null,
			plantToGrow: currentContract.plantToGrow,
			plantTier: currentContract.plantTier,
			contractsCompleted: contractsCompleted + 1
		};

		await user.update({
			minion_farmingContract: farmingContractUpdate as any
		});

		loot.add('Seed pack');

		janeMessage = true;
	}

	if (loot.length > 0) {
		infoStr.push(`\nYou received: ${loot}.`);
	}

	const reminder = !planting
		? 'The patches have been cleared. They are ready to have new seeds planted.'
		: `${user.minionName} tells you to come back after your plants have finished growing!`;
	infoStr.push(`\n${reminder}`);

	const summary: FarmingStepSummary = {
		planted: planting ? { itemName: plant.name, quantity } : undefined,
		harvested: {
			itemName: plantToHarvest.name,
			quantity: patchType.lastQuantity,
			alive: alivePlants,
			died: patchType.lastQuantity - alivePlants
		},
		reminder,
		payNote: payStr || undefined,
		duration: data.duration,
		xp: {
			planting: plantXp,
			harvest: harvestXp,
			checkHealth: checkHealthXp,
			rake: rakeXp,
			bonus: bonusXP,
			totalFarming: farmingXPAmount,
			woodcutting: woodcuttingXPAmount,
			herblore: herbloreXp
		},
		xpMessages,
		boosts: boosts.length > 0 ? [...boosts] : undefined,
		contractCompleted: janeMessage
	};

	await ClientSettings.updateBankSetting('farming_loot_bank', loot);
	await user.transactItems({
		collectionLog: true,
		itemsToAdd: loot
	});
	await user.statsBankUpdate('farming_harvest_loot_bank', loot);
	if (harvestedPid) {
		await prisma.farmedCrop.update({
			where: {
				id: harvestedPid
			},
			data: {
				date_harvested: new Date()
			}
		});
	}

	const attachment = janeMessage
		? await chatHeadImage({
				content: `You've completed your contract and I have rewarded you with 1 Seed pack. Please open this Seed pack before asking for a new contract!\nYou have completed ${
					contractsCompleted + 1
				} farming contracts.`,
				head: 'jane'
			})
		: undefined;

	return {
		message: infoStr.join('\n'),
		attachment,
		loot: loot.length > 0 ? loot : null,
		summary
	};
}
