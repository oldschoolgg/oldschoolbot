import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { Bank } from 'oldschooljs';

import { client } from '../../..';
import { ArdougneDiary, userhasDiaryTier } from '../../../lib/diaries';
import { Favours, gotFavour } from '../../../lib/minions/data/kourendFavour';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { calcNumOfPatches } from '../../../lib/skilling/functions/calcsFarming';
import Farming from '../../../lib/skilling/skills/farming';
import { SkillsEnum } from '../../../lib/skilling/types';
import { FarmingActivityTaskOptions } from '../../../lib/types/minions';
import { formatDuration, updateBankSetting } from '../../../lib/util';
import addSubTaskToActivityTask from '../../../lib/util/addSubTaskToActivityTask';
import { hasItemEquippedOrInBank } from '../../../lib/util/minionUtils';
import { CompostName, findPlant, getFarmingInfo } from '../../commands/farming';

export async function farmingPlantCommand({
	user,
	plantName,
	quantity,
	autoFarmed,
	channelID
}: {
	user: KlasaUser;
	plantName: string;
	quantity: number | null;
	autoFarmed: boolean;
	channelID: bigint;
}): CommandResponse {
	await user.settings.sync(true);
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

	let wantsToPay = alwaysPay && plant.canPayFarmer;

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

	const storeHarvestableQuantity = patchType.lastQuantity;

	if (
		planted &&
		planted.needsChopForHarvest &&
		planted.treeWoodcuttingLevel &&
		currentWoodcuttingLevel < planted.treeWoodcuttingLevel
	) {
		const gpToCutTree =
			planted.seedType === 'redwood' ? 2000 * storeHarvestableQuantity : 200 * storeHarvestableQuantity;
		if (GP < gpToCutTree) {
			return `${user.minionName} remembers that they do not have ${planted.treeWoodcuttingLevel} Woodcutting or the ${gpToCutTree} GP required to be able to harvest the currently planted trees, and so they cancel their trip.`;
		}
	}

	const compostTier = user.settings.get(UserSettings.Minion.DefaultCompostToUse);
	infoStr.push(`You are treating all of your patches with ${compostTier}.`);

	const [numOfPatches, noFarmGuild] = calcNumOfPatches(plant, user, questPoints);
	if (numOfPatches === 0) {
		return 'There are no available patches to you. Note: 60% Hosidius favour is required for farming guild.';
	}

	const maxTripLength = user.maxTripLength('Farming');

	// If no quantity provided, set it to the max PATCHES available.
	if (quantity === null) {
		quantity = Math.floor(maxTripLength / (timePerPatchTravel + timePerPatchPlant + timePerPatchHarvest));
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
		)}, try a lower quantity. The highest amount of ${plant.name} you can plant is ${
			(Math.floor(maxTripLength / (timePerPatchTravel + timePerPatchPlant + timePerPatchHarvest)), numOfPatches)
		}.`;
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

	let upgradeType: CompostName | null = null;

	if (plant.canCompostandPay && compostTier) {
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
		if (hasItemEquippedOrInBank(user, 'Magic secateurs')) {
			boostStr.push('10% crop yield for Magic Secateurs');
		}

		if (hasItemEquippedOrInBank(user, ['Farming cape(t)', 'Farming cape'])) {
			boostStr.push('5% crop yield for Farming Skillcape');
		}

		infoStr.unshift(
			`${user.minionName} is now harvesting ${storeHarvestableQuantity}x ${patchType.lastPlanted}, and then planting ${quantity}x ${plant.name}.`
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
