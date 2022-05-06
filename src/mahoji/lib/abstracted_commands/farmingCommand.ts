import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { client } from '../../..';
import { superCompostables } from '../../../lib/data/filterables';
import { ArdougneDiary, userhasDiaryTier } from '../../../lib/diaries';
import { Favours, gotFavour } from '../../../lib/minions/data/kourendFavour';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { calcNumOfPatches } from '../../../lib/skilling/functions/calcsFarming';
import Farming from '../../../lib/skilling/skills/farming';
import { Plant, SkillsEnum } from '../../../lib/skilling/types';
import { FarmingActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, stringMatches, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { hasItemsEquippedOrInBank } from '../../../lib/util/minionUtils';
import { CompostName, farmingPatchNames, findPlant, getFarmingInfo, isPatchName } from '../../commands/farming';
import { handleMahojiConfirmation } from '../../mahojiSettings';

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
	user: KlasaUser;
	channelID: bigint;
	seedType: string;
}) {
	if (user.minionIsBusy) {
		return 'Your minion must not be busy to use this command.';
	}
	const GP = user.settings.get(UserSettings.GP);
	const currentWoodcuttingLevel = user.skillLevel(SkillsEnum.Woodcutting);
	const currentDate = new Date().getTime();
	if (!isPatchName(seedType)) {
		return `That is not a valid patch type! The available patches are: ${farmingPatchNames.join(
			', '
		)}. *Don't include numbers, this command harvests all crops available of the specified patch type.*`;
	}
	const { patchesDetailed } = await getFarmingInfo(user.id);
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

	if (user.hasGracefulEquipped()) {
		boostStr.push('10% time for Graceful');
		duration *= 0.9;
	}

	if (hasItemsEquippedOrInBank(user, ['Ring of endurance'])) {
		boostStr.push('10% time for Ring of Endurance');
		duration *= 0.9;
	}

	const maxTripLength = user.maxTripLength('Farming');

	if (duration > maxTripLength) {
		return `${user.minionName} can't go on trips longer than ${formatDuration(
			maxTripLength
		)}, try a lower quantity.`;
	}

	if (hasItemsEquippedOrInBank(user, ['Magic secateurs'])) {
		boostStr.push('10% crop yield for Magic Secateurs');
	}

	if (hasItemsEquippedOrInBank(user, ['Farming cape'])) {
		boostStr.push('5% crop yield for Farming Skillcape');
	}

	returnMessageStr = `${user.minionName} is now harvesting ${patch.lastQuantity}x ${storeHarvestablePlant}.
It'll take around ${formatDuration(duration)} to finish.
	
${boostStr.length > 0 ? '**Boosts**: ' : ''}${boostStr.join(', ')}`;

	await addSubTaskToActivityTask<FarmingActivityTaskOptions>({
		plantsName: patch.lastPlanted,
		patchType: patch,
		userID: user.id,
		channelID: channelID.toString(),
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
	user,
	plantName,
	quantity,
	autoFarmed,
	channelID,
	pay
}: {
	user: KlasaUser;
	plantName: string;
	quantity: number | null;
	autoFarmed: boolean;
	channelID: bigint;
	pay: boolean;
}): Promise<string> {
	await user.settings.sync(true);
	if (user.minionIsBusy) {
		return 'Your minion must not be busy to use this command.';
	}
	const userBank = user.bank();
	const alwaysPay = user.settings.get(UserSettings.Minion.DefaultPay);
	const questPoints = user.settings.get(UserSettings.QP);
	const GP = user.settings.get(UserSettings.GP);
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

	let wantsToPay = (pay || alwaysPay) && plant.canPayFarmer;

	if (user.skillLevel(SkillsEnum.Farming) < plant.level) {
		return `${user.minionName} needs ${plant.level} Farming to plant ${plant.name}.`;
	}

	const [hasFavour, requiredPoints] = gotFavour(user, Favours.Hosidius, 65);
	if (!hasFavour && plant.name === 'Grape') {
		return `${user.minionName} needs ${requiredPoints}% Hosidius Favour to plant Grapes.`;
	}

	const { patchesDetailed } = await getFarmingInfo(BigInt(user.id));
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

	const [numOfPatches, noFarmGuild] = calcNumOfPatches(plant, user, questPoints);
	if (numOfPatches === 0) {
		return 'There are no available patches to you. Note: 60% Hosidius favour is required for farming guild.';
	}

	const maxTripLength = user.maxTripLength('Farming');

	// If no quantity provided, set it to the max PATCHES available.
	const maxCanDo = Math.floor(maxTripLength / (timePerPatchTravel + timePerPatchPlant + timePerPatchHarvest));
	if (quantity === null) {
		quantity = maxCanDo;
	}
	quantity = Math.min(quantity, numOfPatches);

	if (quantity > numOfPatches) {
		return `There are not enough ${plant.seedType} patches to plant that many. The max amount of patches to plant in is ${numOfPatches}.`;
	}

	let duration: number = 0;
	if (patchType.patchPlanted) {
		duration = patchType.lastQuantity * (timePerPatchTravel + timePerPatchPlant + timePerPatchHarvest);
		if (quantity > patchType.lastQuantity) {
			duration += (quantity - patchType.lastQuantity) * (timePerPatchTravel + timePerPatchPlant);
		}
	} else {
		duration = quantity * (timePerPatchTravel + timePerPatchPlant);
	}

	// Reduce time if user has graceful equipped
	if (user.hasGracefulEquipped()) {
		boostStr.push('10% time for Graceful');
		duration *= 0.9;
	}

	if (user.hasItemEquippedAnywhere('Ring of endurance')) {
		boostStr.push('10% time for Ring of Endurance');
		duration *= 0.9;
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
		for (const [payment, qty] of plant.protectionPayment.items()) {
			if (userBank.amount(payment.id) >= qty * quantity) {
				cost.add(payment.id, qty * quantity);
				didPay = true;
			}
		}
	}

	if (didPay) {
		infoStr.push('You are paying a nearby farmer to look after your patches.');
	} else if (wantsToPay) {
		infoStr.push('You did not have enough payment to automatically pay for crop protection.');
	}

	const compostTier = user.settings.get(UserSettings.Minion.DefaultCompostToUse) ?? 'compost';
	let upgradeType: CompostName | null = null;
	if ((didPay && plant.canCompostandPay) || (!didPay && plant.canCompostPatch && compostTier)) {
		const compostCost = new Bank().add(compostTier, quantity);
		if (user.owns(compostCost)) {
			infoStr.push(`You are treating your patches with ${compostCost}.`);
			cost.add(compostCost);
			upgradeType = compostTier;
		}
	}

	if (!user.owns(cost)) return `You don't own ${cost}.`;
	await user.removeItemsFromBank(cost);

	updateBankSetting(client, ClientSettings.EconomyStats.FarmingCostBank, cost);
	// If user does not have something already planted, just plant the new seeds.
	if (!patchType.patchPlanted) {
		infoStr.unshift(`${user.minionName} is now planting ${quantity}x ${plant.name}.`);
	} else if (patchType.patchPlanted) {
		if (hasItemsEquippedOrInBank(user, ['Magic secateurs'])) {
			boostStr.push('10% crop yield for Magic Secateurs');
		}
		if (hasItemsEquippedOrInBank(user, ['Farming cape'])) {
			boostStr.push('5% crop yield for Farming Skillcape');
		}

		infoStr.unshift(
			`${user.minionName} is now harvesting ${patchType.lastQuantity}x ${patchType.lastPlanted}, and then planting ${quantity}x ${plant.name}.`
		);
	}

	for (const [diary, tier] of [[ArdougneDiary, ArdougneDiary.elite]] as const) {
		const [has] = await userhasDiaryTier(user, tier);
		if (has) {
			boostStr.push(`4% for ${diary.name} ${tier.name}`);
			duration *= 0.96;
		}
	}

	if (noFarmGuild) boostStr.push(noFarmGuild);

	await addSubTaskToActivityTask<FarmingActivityTaskOptions>({
		plantsName: plant.name,
		patchType,
		userID: user.id,
		channelID: channelID.toString(),
		quantity,
		upgradeType,
		payment: didPay,
		planting: true,
		duration,
		currentDate,
		type: 'Farming',
		autoFarmed
	});

	return `${infoStr.join(' ')}
It'll take around ${formatDuration(duration)} to finish.

${boostStr.length > 0 ? '**Boosts**: ' : ''}${boostStr.join(', ')}`;
}

export async function compostBinCommand(
	interaction: SlashCommandInteraction,
	user: KlasaUser,
	cropToCompost: string,
	quantity: number | undefined
) {
	const superCompostableCrop = superCompostables.find(crop => stringMatches(crop, cropToCompost));
	if (!superCompostableCrop) {
		return `That's not a valid crop to compost. The crops you can compost are: ${superCompostables.join(', ')}.`;
	}

	const userBank = user.bank();
	if (!quantity) quantity = userBank.amount(superCompostableCrop);
	const cost = new Bank().add(superCompostableCrop, quantity);
	const loot = new Bank().add('Supercompost', quantity);

	if (!userBank.has(cost)) return `You do not have enough ${superCompostableCrop}.`;

	if (quantity === 0) return `You have no ${superCompostableCrop} to compost!`;

	await handleMahojiConfirmation(
		interaction,
		`${user}, please confirm that you want to compost ${cost} into ${loot}.`
	);

	await user.removeItemsFromBank(cost);
	await user.addItemsToBank({ items: loot });

	return `You composted ${cost} into ${loot}.`;
}
