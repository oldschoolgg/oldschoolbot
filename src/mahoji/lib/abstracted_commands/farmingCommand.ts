import type { CropUpgradeType } from '@prisma/client';
import type { ChatInputCommandInteraction } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { superCompostables } from '../../../lib/data/filterables';
import { ArdougneDiary, userhasDiaryTier } from '../../../lib/diaries';

import { calcNumOfPatches } from '../../../lib/skilling/functions/calcsFarming';
import { getFarmingInfo } from '../../../lib/skilling/functions/getFarmingInfo';
import Farming from '../../../lib/skilling/skills/farming';
import type { Plant } from '../../../lib/skilling/types';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { FarmingActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../../lib/util/calcMaxTripLength';
import { farmingPatchNames, findPlant, isPatchName } from '../../../lib/util/farmingHelpers';
import { handleMahojiConfirmation } from '../../../lib/util/handleMahojiConfirmation';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';
import { userHasGracefulEquipped, userStatsBankUpdate } from '../../mahojiSettings';

function treeCheck(plant: Plant, wcLevel: number, bal: number, quantity: number): string | null {
	if (plant.needsChopForHarvest && plant.treeWoodcuttingLevel && wcLevel < plant.treeWoodcuttingLevel) {
		const gpToCutTree = plant.seedType === 'redwood' ? 2000 * quantity : 200 * quantity;
		if (bal < gpToCutTree) {
			return `Your minion does not have ${plant.treeWoodcuttingLevel} Woodcutting or the ${gpToCutTree} GP required to be able to harvest the currently planted trees, and so they cannot harvest them.`;
		}
	}
	return null;
}

export async function harvestCommand({
	user,
	channelID,
	seedType
}: {
	user: MUser;
	channelID: string;
	seedType: string;
}) {
	if (user.minionIsBusy) {
		return 'Your minion must not be busy to use this command.';
	}
	const { GP } = user;
	const currentWoodcuttingLevel = user.skillLevel(SkillsEnum.Woodcutting);
	const currentDate = new Date().getTime();
	if (!isPatchName(seedType)) {
		return `That is not a valid patch type! The available patches are: ${farmingPatchNames.join(
			', '
		)}. *Don't include numbers, this command harvests all crops available of the specified patch type.*`;
	}
	const { patchesDetailed, patches } = await getFarmingInfo(user.id);
	const patch = patchesDetailed.find(i => i.patchName === seedType)!;
	if (patch.ready === null) return 'You have nothing planted in those patches.';

	const upgradeType = null;
	let returnMessageStr = '';
	const boostStr = [];

	const storeHarvestablePlant = patch.lastPlanted;
	const plant = findPlant(patch.lastPlanted)!;

	if (!patch.ready) {
		return `Please come back when your crops have finished growing in ${formatDuration(patch.readyIn!)}!`;
	}

	const treeStr = !plant ? null : treeCheck(plant, currentWoodcuttingLevel, GP, patch.lastQuantity);
	if (treeStr) return treeStr;

	const timePerPatchTravel = Time.Second * plant.timePerPatchTravel;
	const timePerPatchHarvest = Time.Second * plant.timePerHarvest;

	// 1.5 mins per patch --> ex: 10 patches = 15 mins
	let duration = patch.lastQuantity * (timePerPatchTravel + timePerPatchHarvest);

	if (userHasGracefulEquipped(user)) {
		boostStr.push('10% time for Graceful');
		duration *= 0.9;
	}

	if (user.hasEquippedOrInBank(['Ring of endurance'])) {
		boostStr.push('10% time for Ring of Endurance');
		duration *= 0.9;
	}

	const maxTripLength = calcMaxTripLength(user, 'Farming');

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity.`;
	}

	if (user.hasEquippedOrInBank(['Magic secateurs'])) {
		boostStr.push('10% crop yield for Magic Secateurs');
	}

	if (user.hasEquippedOrInBank(['Farming cape'])) {
		boostStr.push('5% crop yield for Farming Skillcape');
	}

	returnMessageStr = `${user.minionName} is now harvesting ${patch.lastQuantity}x ${storeHarvestablePlant}.
It'll take around ${formatDuration(duration)} to finish.
	
${boostStr.length > 0 ? '**Boosts**: ' : ''}${boostStr.join(', ')}`;

	await addSubTaskToActivityTask<FarmingActivityTaskOptions>({
		plantsName: patch.lastPlanted,
		patchType: patches[patch.patchName],
		userID: user.id,
		channelID,
		upgradeType,
		duration,
		quantity: patch.lastQuantity,
		planting: false,
		currentDate,
		type: 'Farming',
		autoFarmed: false
	});

	return returnMessageStr;
}

export async function farmingPlantCommand({
	plantName,
	quantity,
	autoFarmed,
	channelID,
	pay,
	userID
}: {
	userID: string;
	plantName: string;
	quantity: number | null;
	autoFarmed: boolean;
	channelID: string;
	pay: boolean;
}): Promise<string> {
	const user = await mUserFetch(userID);
	if (user.minionIsBusy) {
		return 'Your minion must not be busy to use this command.';
	}
	const userBank = user.bank;
	const alwaysPay = user.user.minion_defaultPay;
	const questPoints = user.QP;
	const { GP } = user;
	const currentWoodcuttingLevel = user.skillLevel(SkillsEnum.Woodcutting);
	const currentDate = new Date().getTime();

	const infoStr: string[] = [];
	const boostStr: string[] = [];

	const plant = findPlant(plantName);

	if (!plant) {
		return `That's not a valid seed to plant. Valid seeds are ${Farming.Plants.map(plants => plants.name).join(
			', '
		)}. *Make sure you are not attempting to farm 0 crops.*`;
	}

	const wantsToPay = (pay || alwaysPay) && plant.canPayFarmer;

	if (user.skillLevel(SkillsEnum.Farming) < plant.level) {
		return `${user.minionName} needs ${plant.level} Farming to plant ${plant.name}.`;
	}

	const { patchesDetailed, patches } = await getFarmingInfo(user.id);
	const patchType = patchesDetailed.find(i => i.patchName === plant.seedType)!;

	const timePerPatchTravel = Time.Second * plant.timePerPatchTravel;
	const timePerPatchHarvest = Time.Second * plant.timePerHarvest;
	const timePerPatchPlant = Time.Second * 5;

	const planted = findPlant(patchType.lastPlanted);

	if (patchType.ready === false) {
		return `Please come back when your crops have finished growing in ${formatDuration(patchType.readyIn!)}!`;
	}

	const treeStr = !planted ? null : treeCheck(planted, currentWoodcuttingLevel, GP, patchType.lastQuantity);
	if (treeStr) return treeStr;

	const [numOfPatches] = calcNumOfPatches(plant, user, questPoints);
	if (numOfPatches === 0) {
		return 'There are no available patches to you.';
	}

	const maxTripLength = calcMaxTripLength(user, 'Farming');

	// If no quantity provided, set it to the max PATCHES available.
	const maxCanDo = Math.floor(maxTripLength / (timePerPatchTravel + timePerPatchPlant + timePerPatchHarvest));
	if (quantity === null) {
		quantity = maxCanDo;
	}
	quantity = Math.min(quantity, numOfPatches);

	if (quantity > numOfPatches) {
		return `There are not enough ${plant.seedType} patches to plant that many. The max amount of patches to plant in is ${numOfPatches}.`;
	}

	let duration = 0;
	if (patchType.patchPlanted) {
		duration = patchType.lastQuantity * (timePerPatchTravel + timePerPatchPlant + timePerPatchHarvest);
		if (quantity > patchType.lastQuantity) {
			duration += (quantity - patchType.lastQuantity) * (timePerPatchTravel + timePerPatchPlant);
		}
	} else {
		duration = quantity * (timePerPatchTravel + timePerPatchPlant);
	}

	// Reduce time if user has graceful equipped
	if (userHasGracefulEquipped(user)) {
		boostStr.push('10% time for Graceful');
		duration *= 0.9;
	}

	if (user.hasEquipped('Ring of endurance')) {
		boostStr.push('10% time for Ring of Endurance');
		duration *= 0.9;
	}

	for (const [diary, tier] of [[ArdougneDiary, ArdougneDiary.elite]] as const) {
		const [has] = await userhasDiaryTier(user, tier);
		if (has) {
			boostStr.push(`4% time for ${diary.name} ${tier.name}`);
			duration *= 0.96;
		}
	}

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity. The highest amount of ${plant.name} you can plant is ${maxCanDo}.`;
	}

	const cost = new Bank();
	for (const [seed, qty] of plant.inputItems.items()) {
		if (userBank.amount(seed.id) < qty * quantity) {
			if (userBank.amount(seed.id) > qty) {
				quantity = Math.floor(userBank.amount(seed.id) / qty);
			}
		}
		cost.add(seed.id, qty * quantity);
	}

	let didPay = false;
	if (wantsToPay && plant.protectionPayment) {
		const paymentCost = plant.protectionPayment.clone().multiply(quantity);
		if (userBank.has(paymentCost)) {
			cost.add(paymentCost);
			didPay = true;
			infoStr.push(`You are paying a nearby farmer ${paymentCost} to look after your patches.`);
		} else {
			infoStr.push('You did not have enough payment to automatically pay for crop protection.');
		}
	}

	const compostTier = (user.user.minion_defaultCompostToUse as CropUpgradeType) ?? 'compost';
	let upgradeType: CropUpgradeType | null = null;
	if ((didPay && plant.canCompostandPay) || (!didPay && plant.canCompostPatch && compostTier)) {
		const compostCost = new Bank().add(compostTier, quantity);
		if (user.owns(compostCost)) {
			infoStr.push(`You are treating your patches with ${compostCost}.`);
			cost.add(compostCost);
			upgradeType = compostTier;
		}
	}

	if (!user.owns(cost)) return `You don't own ${cost}.`;
	await transactItems({ userID: user.id, itemsToRemove: cost });

	updateBankSetting('farming_cost_bank', cost);
	// If user does not have something already planted, just plant the new seeds.
	if (!patchType.patchPlanted) {
		infoStr.unshift(`${user.minionName} is now planting ${quantity}x ${plant.name}.`);
	} else if (patchType.patchPlanted) {
		if (user.hasEquippedOrInBank(['Magic secateurs'])) {
			boostStr.push('10% crop yield for Magic Secateurs');
		}
		if (user.hasEquippedOrInBank(['Farming cape'])) {
			boostStr.push('5% crop yield for Farming Skillcape');
		}

		infoStr.unshift(
			`${user.minionName} is now harvesting ${patchType.lastQuantity}x ${patchType.lastPlanted}, and then planting ${quantity}x ${plant.name}.`
		);
	}

	const inserted = await prisma.farmedCrop.create({
		data: {
			user_id: user.id,
			date_planted: new Date(),
			item_id: plant.id,
			quantity_planted: quantity,
			was_autofarmed: autoFarmed,
			paid_for_protection: didPay,
			upgrade_type: upgradeType
		}
	});

	await userStatsBankUpdate(user, 'farming_plant_cost_bank', cost);

	await addSubTaskToActivityTask<FarmingActivityTaskOptions>({
		plantsName: plant.name,
		patchType: patches[plant.seedType],
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		upgradeType,
		payment: didPay,
		planting: true,
		duration,
		currentDate,
		type: 'Farming',
		autoFarmed,
		pid: inserted.id
	});

	return `${infoStr.join(' ')}
It'll take around ${formatDuration(duration)} to finish.

${boostStr.length > 0 ? '**Boosts**: ' : ''}${boostStr.join(', ')}`;
}

export async function compostBinCommand(
	interaction: ChatInputCommandInteraction,
	user: MUser,
	cropToCompost: string,
	quantity: number | undefined
) {
	const superCompostableCrop = superCompostables.find(crop => stringMatches(crop, cropToCompost));
	if (!superCompostableCrop) {
		return `That's not a valid crop to compost. The crops you can compost are: ${superCompostables.join(', ')}.`;
	}

	const userBank = user.bank;
	if (!quantity) quantity = userBank.amount(superCompostableCrop);
	const cost = new Bank().add(superCompostableCrop, quantity);
	const loot = new Bank().add('Supercompost', quantity);

	if (!userBank.has(cost)) return `You do not have enough ${superCompostableCrop}.`;

	if (quantity === 0) return `You have no ${superCompostableCrop} to compost!`;

	await handleMahojiConfirmation(
		interaction,
		`${user}, please confirm that you want to compost ${cost} into ${loot}.`
	);

	await transactItems({ userID: user.id, itemsToRemove: cost });
	await user.addItemsToBank({ items: loot });

	return `You composted ${cost} into ${loot}.`;
}
