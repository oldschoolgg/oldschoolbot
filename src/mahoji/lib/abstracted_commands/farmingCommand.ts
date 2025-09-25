import { Time } from '@oldschoolgg/toolkit/datetime';
import { formatDuration, stringMatches } from '@oldschoolgg/toolkit/util';
import type { CropUpgradeType } from '@prisma/client';
import type { ChatInputCommandInteraction } from 'discord.js';
import { Bank } from 'oldschooljs';

import { superCompostables } from '@/lib/data/filterables.js';
import { prepareFarmingStep, treeCheck } from '@/lib/minions/functions/farmingTripHelpers.js';
import { calcNumOfPatches } from '@/lib/skilling/functions/calcsFarming.js';
import { getFarmingInfo, getFarmingInfoFromUser } from '@/lib/skilling/functions/getFarmingInfo.js';
import Farming from '@/lib/skilling/skills/farming/index.js';
import { SkillsEnum } from '@/lib/skilling/types.js';
import type { FarmingActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { farmingPatchNames, findPlant, isPatchName } from '@/lib/util/farmingHelpers.js';
import { handleMahojiConfirmation } from '@/lib/util/handleMahojiConfirmation.js';
import { updateBankSetting } from '@/lib/util/updateBankSetting.js';
import { userHasGracefulEquipped, userStatsBankUpdate } from '@/mahoji/mahojiSettings.js';

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
	const currentDate = Date.now();
	if (!isPatchName(seedType)) {
		return `That is not a valid patch type! The available patches are: ${farmingPatchNames.join(
			', '
		)}. *Don't include numbers, this command harvests all crops available of the specified patch type.*`;
	}
	const { patchesDetailed, patches } = await getFarmingInfoFromUser(user.user);
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

	const treeCheckResult = !plant
		? { error: null, fee: 0 }
		: treeCheck(plant, currentWoodcuttingLevel, GP, patch.lastQuantity);
	if (treeCheckResult.error) return treeCheckResult.error;

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
	const alwaysPay = user.user.minion_defaultPay;
	const questPoints = user.QP;
	const currentDate = Date.now();

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

	const [numOfPatches] = calcNumOfPatches(plant, user, questPoints);
	if (numOfPatches === 0) {
		return 'There are no available patches to you.';
	}

	const maxTripLength = calcMaxTripLength(user, 'Farming');

	if (quantity !== null && quantity > numOfPatches) {
		return `There are not enough ${plant.seedType} patches to plant that many. The max amount of patches to plant in is ${numOfPatches}.`;
	}

	const compostTier = (user.user.minion_defaultCompostToUse as CropUpgradeType) ?? 'compost';
	const availableBank = user.bank.clone().add('Coins', user.GP);
	const prepared = await prepareFarmingStep({
		user,
		plant,
		quantity,
		pay: wantsToPay,
		patchDetailed: patchType,
		maxTripLength,
		availableBank,
		compostTier
	});
	if (!prepared.success) {
		return prepared.error;
	}

	quantity = prepared.data.quantity;
	const { cost, didPay, duration, upgradeType, infoStr: preparedInfo, boostStr: preparedBoosts } = prepared.data;
	infoStr.push(...preparedInfo);
	boostStr.push(...preparedBoosts);

	if (!user.owns(cost)) return `You don't own ${cost}.`;
	await user.transactItems({ itemsToRemove: cost });

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
			date_planted: new Date(currentDate),
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

	await user.transactItems({ itemsToRemove: cost });
	await user.addItemsToBank({ items: loot });

	return `You composted ${cost} into ${loot}.`;
}
