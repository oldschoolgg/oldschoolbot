import { formatDuration } from '@oldschoolgg/toolkit/util';
import { AutoFarmFilterEnum, type CropUpgradeType } from '@prisma/client';
import { Bank, SkillsEnum } from 'oldschooljs';

import type { IPatchData, IPatchDataDetailed } from '@/lib/minions/farming/types.js';
import { plants } from '@/lib/skilling/skills/farming/index.js';
import type { Plant } from '@/lib/skilling/types.js';
import type { AutoFarmStepData, FarmingActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import type { FarmingPatchName } from '@/lib/util/farmingHelpers.js';
import { updateBankSetting } from '@/lib/util/updateBankSetting.js';
import { userStatsBankUpdate } from '@/mahoji/mahojiSettings.js';
import { allFarm, replant } from './autoFarmFilters.js';
import { prepareFarmingStep } from './farmingTripHelpers.js';

interface PlannedAutoFarmStep {
	plant: Plant;
	quantity: number;
	duration: number;
	upgradeType: CropUpgradeType | null;
	didPay: boolean;
	treeChopFee: number;
	patch: IPatchData;
	patchName: FarmingPatchName;
	friendlyName: string;
	info: string[];
	boosts: string[];
}

export async function autoFarm(
	user: MUser,
	patchesDetailed: IPatchDataDetailed[],
	patches: Record<FarmingPatchName, IPatchData>,
	channelID: string
) {
	if (user.minionIsBusy) {
		return 'Your minion must not be busy to use this command.';
	}

	const farmingLevel = user.skillLevel(SkillsEnum.Farming);
	let { autoFarmFilter } = user;
	if (!autoFarmFilter) {
		autoFarmFilter = AutoFarmFilterEnum.AllFarm;
	}

	const baseBank = user.bank.clone().add('Coins', user.GP);

	const eligiblePlants = [...plants]
		.filter(p => {
			switch (autoFarmFilter) {
				case AutoFarmFilterEnum.AllFarm:
					return allFarm(p, farmingLevel, user, user.bank);
				case AutoFarmFilterEnum.Replant:
					return replant(p, farmingLevel, user, user.bank, patchesDetailed);
				default:
					return allFarm(p, farmingLevel, user, user.bank);
			}
		})
		.sort((a, b) => b.level - a.level);

	const maxTripLength = calcMaxTripLength(user, 'Farming');
	const compostTier = (user.user.minion_defaultCompostToUse as CropUpgradeType) ?? 'compost';
	const plannedSteps: PlannedAutoFarmStep[] = [];
	const usedPatches = new Set<FarmingPatchName>();
	const summaryLines: string[] = [];
	let totalDuration = 0;
	const totalCost = new Bank();
	const remainingBank = baseBank.clone();

	let errorString = '';
	if (autoFarmFilter === AutoFarmFilterEnum.AllFarm) {
		errorString = "There's no Farming crops that you have the requirements to plant, and nothing to harvest.";
	} else {
		errorString =
			"There's no Farming crops that you have planted that are ready to be replanted or no seeds remaining.";
	}

	for (const plant of eligiblePlants) {
		if (totalDuration >= maxTripLength) {
			break;
		}
		const patchDetailed = patchesDetailed.find(p => p.patchName === plant.seedType);
		if (!patchDetailed) continue;
		if (usedPatches.has(patchDetailed.patchName)) continue;
		if (patchDetailed.ready === false) continue;

		const remainingTime = maxTripLength - totalDuration;
		if (remainingTime <= 0) break;

		const prepared = await prepareFarmingStep({
			user,
			plant,
			quantity: null,
			pay: false,
			patchDetailed,
			maxTripLength: remainingTime,
			availableBank: remainingBank,
			compostTier
		});
		if (!prepared.success) {
			continue;
		}

		const { quantity, duration, cost, upgradeType, didPay, infoStr, boostStr, treeChopFee } = prepared.data;
		if (quantity <= 0 || duration <= 0) {
			continue;
		}
		if (!remainingBank.has(cost)) {
			continue;
		}

		remainingBank.remove(cost);
		totalCost.add(cost);
		totalDuration += duration;

		const patch = patches[plant.seedType];
		plannedSteps.push({
			plant,
			quantity,
			duration,
			upgradeType,
			didPay,
			treeChopFee,
			patch,
			patchName: patchDetailed.patchName,
			friendlyName: patchDetailed.friendlyName,
			info: infoStr,
			boosts: boostStr
		});
		usedPatches.add(patchDetailed.patchName);
		summaryLines.push(`${plannedSteps.length}. ${patchDetailed.friendlyName}: ${quantity}x ${plant.name}`);
	}

	if (plannedSteps.length === 0) {
		return errorString;
	}

	if (!user.owns(totalCost)) {
		return `You don't own ${totalCost}.`;
	}
	await user.transactItems({ itemsToRemove: totalCost });
	updateBankSetting('farming_cost_bank', totalCost);
	await userStatsBankUpdate(user, 'farming_plant_cost_bank', totalCost);

	const autoFarmPlan: AutoFarmStepData[] = [];
	const planningStartTime = Date.now();
	let accumulatedDuration = 0;
	for (const step of plannedSteps) {
		const inserted = await prisma.farmedCrop.create({
			data: {
				user_id: user.id,
				date_planted: new Date(planningStartTime + accumulatedDuration),
				item_id: step.plant.id,
				quantity_planted: step.quantity,
				was_autofarmed: true,
				paid_for_protection: step.didPay,
				upgrade_type: step.upgradeType
			}
		});

		autoFarmPlan.push({
			plantsName: step.plant.name,
			quantity: step.quantity,
			upgradeType: step.upgradeType,
			payment: step.didPay,
			treeChopFeePaid: step.treeChopFee,
			patchType: step.patch,
			planting: true,
			currentDate: planningStartTime + accumulatedDuration,
			duration: step.duration,
			pid: inserted.id
		});
		accumulatedDuration += step.duration;
	}

	const [firstStep, ...remainingSteps] = autoFarmPlan;
	if (!firstStep) {
		return errorString;
	}

	await addSubTaskToActivityTask<FarmingActivityTaskOptions>({
		plantsName: firstStep.plantsName,
		patchType: firstStep.patchType,
		userID: user.id,
		channelID: channelID.toString(),
		quantity: firstStep.quantity,
		upgradeType: firstStep.upgradeType,
		payment: firstStep.payment,
		treeChopFeePaid: firstStep.treeChopFeePaid,
		planting: firstStep.planting,
		duration: firstStep.duration,
		currentDate: firstStep.currentDate,
		type: 'Farming',
		autoFarmed: true,
		pid: firstStep.pid,
		autoFarmPlan: remainingSteps
	});

	const uniqueBoosts = [...new Set(plannedSteps.flatMap(step => step.boosts))];
	const infoDetails = plannedSteps.flatMap(step => step.info.map(line => `${step.friendlyName}: ${line}`));

	let response = `${user.minionName} is now auto farming the following patches:\n${summaryLines.join('\n')}\nIt'll take around ${formatDuration(totalDuration)} to finish.`;

	if (infoDetails.length > 0) {
		response += `\n\n${infoDetails.join('\n')}`;
	}
	if (uniqueBoosts.length > 0) {
		response += `\n\n**Boosts**: ${uniqueBoosts.join(', ')}`;
	}

	return response;
}
