import { Time } from '@oldschoolgg/toolkit/datetime';
import { formatDuration } from '@oldschoolgg/toolkit/util';
import type { CropUpgradeType } from '@prisma/client';
import { Bank } from 'oldschooljs';

import { ArdougneDiary, userhasDiaryTier } from '@/lib/diaries.js';
import type { IPatchDataDetailed } from '@/lib/minions/farming/types.js';
import { calcNumOfPatches } from '@/lib/skilling/functions/calcsFarming.js';
import type { Plant } from '@/lib/skilling/types.js';
import { SkillsEnum } from '@/lib/skilling/types.js';
import { userHasGracefulEquipped } from '@/mahoji/mahojiSettings.js';

export interface PrepareFarmingStepOptions {
	user: MUser;
	plant: Plant;
	quantity: number | null;
	pay: boolean;
	patchDetailed: IPatchDataDetailed;
	maxTripLength: number;
	availableBank: Bank;
	compostTier: CropUpgradeType;
}

export interface PreparedFarmingStep {
	quantity: number;
	duration: number;
	cost: Bank;
	didPay: boolean;
	upgradeType: CropUpgradeType | null;
	infoStr: string[];
	boostStr: string[];
}

export function treeCheck(plant: Plant, wcLevel: number, bal: number, quantity: number): string | null {
	if (plant.needsChopForHarvest && plant.treeWoodcuttingLevel && wcLevel < plant.treeWoodcuttingLevel) {
		const gpToCutTree = plant.seedType === 'redwood' ? 2000 * quantity : 200 * quantity;
		if (bal < gpToCutTree) {
			return `Your minion does not have ${plant.treeWoodcuttingLevel} Woodcutting or the ${gpToCutTree} GP required to be able to harvest the currently planted trees, and so they cannot harvest them.`;
		}
	}
	return null;
}

export async function prepareFarmingStep({
	user,
	plant,
	quantity,
	pay,
	patchDetailed,
	maxTripLength,
	availableBank,
	compostTier
}: PrepareFarmingStepOptions): Promise<
	{ success: true; data: PreparedFarmingStep } | { success: false; error: string }
> {
	const infoStr: string[] = [];
	const boostStr: string[] = [];

	if (patchDetailed.ready === false) {
		return {
			success: false,
			error: `Please come back when your crops have finished growing in ${formatDuration(patchDetailed.readyIn!)}!`
		};
	}

	const currentWoodcuttingLevel = user.skillLevel(SkillsEnum.Woodcutting);
	const { GP } = user;

	if (patchDetailed.patchPlanted && patchDetailed.lastPlanted) {
		const plantedPlant = plant.name === patchDetailed.lastPlanted ? plant : null;
		if (plantedPlant) {
			const treeStr = treeCheck(plantedPlant, currentWoodcuttingLevel, GP, patchDetailed.lastQuantity);
			if (treeStr) {
				return { success: false, error: treeStr };
			}
		}
	}

	const [numOfPatches] = calcNumOfPatches(plant, user, user.QP);
	if (numOfPatches === 0) {
		return { success: false, error: 'There are no available patches to you.' };
	}

	const timePerPatchTravel = Time.Second * plant.timePerPatchTravel;
	const timePerPatchHarvest = Time.Second * plant.timePerHarvest;
	const timePerPatchPlant = Time.Second * 5;

	const maxCanDo = Math.floor(maxTripLength / (timePerPatchTravel + timePerPatchPlant + timePerPatchHarvest));
	let quantityToDo = quantity ?? maxCanDo;
	quantityToDo = Math.min(quantityToDo, numOfPatches);

	if (quantityToDo <= 0) {
		return {
			success: false,
			error: 'There are no available patches to you.'
		};
	}

	const inputItems = [...plant.inputItems.items()];
	for (const [seed, qty] of inputItems) {
		const availableQty = availableBank.amount(seed.id);
		if (availableQty < qty) {
			const singleCost = new Bank().add(seed.id, qty);
			return { success: false, error: `You don't own ${singleCost}.` };
		}
		const maxForThisSeed = Math.floor(availableQty / qty);
		quantityToDo = Math.min(quantityToDo, maxForThisSeed);
	}

	if (quantityToDo <= 0) {
		const minimumCost = inputItems.reduce((bank, [seed, qty]) => bank.add(seed.id, qty), new Bank());
		return { success: false, error: `You don't own ${minimumCost}.` };
	}

	const cost = inputItems.reduce((bank, [seed, qty]) => bank.add(seed.id, qty * quantityToDo), new Bank());

	if (!availableBank.has(cost)) {
		return { success: false, error: `You don't own ${cost}.` };
	}

	const wantsToPay = (pay || user.user.minion_defaultPay) && plant.canPayFarmer;
	let didPay = false;
	if (wantsToPay && plant.protectionPayment) {
		const paymentCost = plant.protectionPayment.clone().multiply(quantityToDo);
		if (availableBank.has(paymentCost)) {
			cost.add(paymentCost);
			didPay = true;
			infoStr.push(`You are paying a nearby farmer ${paymentCost} to look after your patches.`);
		} else {
			infoStr.push('You did not have enough payment to automatically pay for crop protection.');
		}
	}

	let upgradeType: CropUpgradeType | null = null;
	if ((didPay && plant.canCompostandPay) || (!didPay && plant.canCompostPatch && compostTier)) {
		const compostCost = new Bank().add(compostTier, quantityToDo);
		if (availableBank.has(compostCost)) {
			infoStr.push(`You are treating your patches with ${compostCost}.`);
			cost.add(compostCost);
			upgradeType = compostTier;
		}
	}

	let duration = 0;
	if (patchDetailed.patchPlanted) {
		duration = patchDetailed.lastQuantity * (timePerPatchTravel + timePerPatchPlant + timePerPatchHarvest);
		if (quantityToDo > patchDetailed.lastQuantity) {
			duration += (quantityToDo - patchDetailed.lastQuantity) * (timePerPatchTravel + timePerPatchPlant);
		}
	} else {
		duration = quantityToDo * (timePerPatchTravel + timePerPatchPlant);
	}

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
		return {
			success: false,
			error: `${user.minionName} can't go on trips longer than ${formatDuration(maxTripLength)}, try a lower quantity. The highest amount of ${plant.name} you can plant is ${maxCanDo}.`
		};
	}

	return {
		success: true,
		data: {
			quantity: quantityToDo,
			duration,
			cost,
			didPay,
			upgradeType,
			infoStr,
			boostStr
		}
	};
}
