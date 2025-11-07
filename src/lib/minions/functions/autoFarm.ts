import { Emoji, formatDuration, makeComponents, SpecialResponse } from '@oldschoolgg/toolkit';
import type { CropUpgradeType } from '@prisma/client';
import { type BaseMessageOptions, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Bank } from 'oldschooljs';

import { AutoFarmFilterEnum, activity_type_enum } from '@/prisma/main/enums.js';
import type { CommandResponseValue } from '@/lib/discord/index.js';
import { allFarm, replant } from '@/lib/minions/functions/autoFarmFilters.js';
import { plants } from '@/lib/skilling/skills/farming/index.js';
import type { FarmingPatchName } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type { IPatchData, IPatchDataDetailed } from '@/lib/skilling/skills/farming/utils/types.js';
import type { Plant } from '@/lib/skilling/types.js';
import type { AutoFarmStepData, FarmingActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { fetchRepeatTrips, repeatTrip } from '@/lib/util/repeatStoredTrip.js';
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

interface BuildSummaryResult {
	summaryLine: string;
	extraInfoLines: string[];
}

const compostLabels: Record<CropUpgradeType, string> = {
	compost: 'Compost',
	supercompost: 'Supercompost',
	ultracompost: 'Ultracompost'
};

function formatCompostLabel(upgradeType: CropUpgradeType, quantity: number): string {
	const label = compostLabels[upgradeType] ?? upgradeType;
	return `${quantity.toLocaleString()}x ${label}`;
}

function shouldHideInfoLine(line: string): boolean {
	const normalized = line.toLowerCase();
	return (
		normalized.startsWith('you are treating your patches with') ||
		normalized.startsWith('you are paying a nearby farmer') ||
		normalized.startsWith('you may need to pay a nearby farmer')
	);
}

function buildSummaryForStep(index: number, step: PlannedAutoFarmStep): BuildSummaryResult {
	const detailParts: string[] = [];
	if (step.upgradeType) {
		detailParts.push(formatCompostLabel(step.upgradeType, step.quantity));
	}
	if (step.plant.inputItems.length > 0) {
		const seedCost = step.plant.inputItems.clone().multiply(step.quantity);
		detailParts.push(seedCost.toString());
	}
	if (step.didPay && step.plant.protectionPayment) {
		const paymentCost = step.plant.protectionPayment.clone().multiply(step.quantity);
		detailParts.push(`${paymentCost}`);
	}
	if (step.treeChopFee > 0) {
		detailParts.push(`Up to ${step.treeChopFee.toLocaleString()} GP to remove previous trees`);
	}

	let summaryLine = `${index + 1}. ${step.friendlyName}: ${step.quantity.toLocaleString()}x ${step.plant.name}`;
	if (detailParts.length > 0) {
		summaryLine += ` (${detailParts.join(' + ')})`;
	}

	const extraInfoLines = step.info
		.filter(infoLine => !shouldHideInfoLine(infoLine))
		.map(infoLine => `${step.friendlyName}: ${infoLine}`);

	return { summaryLine, extraInfoLines };
}

async function tryRepeatPreviousTrip({
	user,
	interaction,
	errorString
}: {
	user: MUser;
	interaction: MInteraction;
	errorString: string;
}): Promise<CommandResponseValue | null> {
	try {
		const repeatableTrips = await fetchRepeatTrips(user);
		const fallbackTrip = repeatableTrips.find(trip => trip.type !== activity_type_enum.Farming);
		if (!fallbackTrip) {
			return null;
		}
		const response = await repeatTrip(user, interaction, fallbackTrip);
		if (response === SpecialResponse.SilentErrorResponse || response === SpecialResponse.PaginatedMessageResponse) {
			return response;
		}
		if (typeof response === 'string') {
			return `${errorString}\n\n${response}`;
		}
		if (response && typeof response === 'object' && 'content' in response && typeof response.content === 'string') {
			return { ...response, content: `${errorString}\n\n${response.content}` };
		}
		return response;
	} catch (err) {
		Logging.logError(err as Error);
		return null;
	}
}

export async function autoFarm(
	user: MUser,
	patchesDetailed: IPatchDataDetailed[],
	patches: Record<FarmingPatchName, IPatchData>,
	interaction: MInteraction
) {
	if (user.minionIsBusy) {
		return 'Your minion must not be busy to use this command.';
	}

	const farmingLevel = user.skillsAsLevels.farming;
	const channelID = interaction.channelId ?? user.id;

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
	let totalDuration = 0;
	const totalCost = new Bank();
	const remainingBank = baseBank.clone();
	let skippedDueToTripLength = false;

	let errorString = '';
	let firstPrepareError: string | null = null;
	if (autoFarmFilter === AutoFarmFilterEnum.AllFarm) {
		errorString = "There's no Farming crops that you have the requirements to plant, and nothing to harvest.";
	} else {
		errorString =
			"There's no Farming crops that you have planted that are ready to be replanted or no seeds remaining.";
	}

	for (const plant of eligiblePlants) {
		const patchDetailed = patchesDetailed.find(p => p.patchName === plant.seedType);
		if (!patchDetailed) continue;
		if (usedPatches.has(patchDetailed.patchName)) continue;
		if (patchDetailed.ready === false) continue;

		const prepared = await prepareFarmingStep({
			user,
			plant,
			quantity: null,
			pay: false,
			patchDetailed,
			maxTripLength,
			availableBank: remainingBank,
			compostTier
		});
		if (!prepared.success) {
			if (!firstPrepareError) {
				firstPrepareError = prepared.error;
			}
			continue;
		}

		const { quantity, duration, cost, upgradeType, didPay, infoStr, boostStr, treeChopFee } = prepared.data;
		if (quantity <= 0 || duration <= 0) {
			continue;
		}
		if (duration > maxTripLength) {
			if (!firstPrepareError) {
				firstPrepareError = `${user.minionName} can't go on trips longer than ${formatDuration(maxTripLength)}.`;
			}
			continue;
		}
		if (!remainingBank.has(cost)) {
			continue;
		}

		const totalCoinCost = cost.amount('Coins') + treeChopFee;
		if (totalCoinCost > 0 && remainingBank.amount('Coins') < totalCoinCost) {
			if (!firstPrepareError) {
				firstPrepareError = `You don't own ${new Bank().add('Coins', totalCoinCost)}.`;
			}
			continue;
		}

		if (totalDuration + duration > maxTripLength) {
			skippedDueToTripLength = true;
			continue;
		}

		remainingBank.remove(cost);
		if (treeChopFee > 0) {
			remainingBank.remove(new Bank().add('Coins', treeChopFee));
		}
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
	}

	if (plannedSteps.length === 0) {
		if (firstPrepareError !== null) {
			return firstPrepareError;
		}

		const checkPatchesButton = new ButtonBuilder()
			.setCustomId('CHECK_PATCHES')
			.setLabel('Check Patches')
			.setEmoji(Emoji.Stopwatch)
			.setStyle(ButtonStyle.Secondary);

		const noCropsResponse: BaseMessageOptions = {
			content: errorString,
			components: makeComponents([checkPatchesButton])
		};

		const repeated = await tryRepeatPreviousTrip({ user, interaction, errorString });
		if (repeated !== null) {
			return repeated;
		}

		return noCropsResponse;
	}

	if (!user.owns(totalCost)) {
		return `You don't own ${totalCost}.`;
	}
	await user.transactItems({ itemsToRemove: totalCost });
	await ClientSettings.updateBankSetting('farming_cost_bank', totalCost);
	await user.statsBankUpdate('farming_plant_cost_bank', totalCost);

	const autoFarmPlan: AutoFarmStepData[] = [];
	const planningStartTime = Date.now();
	let accumulatedDuration = 0;
	for (const step of plannedSteps) {
		autoFarmPlan.push({
			plantsName: step.plant.name,
			quantity: step.quantity,
			upgradeType: step.upgradeType,
			payment: step.didPay,
			treeChopFeePaid: 0,
			treeChopFeePlanned: step.treeChopFee,
			patchType: step.patch,
			planting: true,
			currentDate: planningStartTime + accumulatedDuration,
			duration: step.duration
		});
		accumulatedDuration += step.duration;
	}

	const firstStep = autoFarmPlan[0];
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
		treeChopFeePlanned: firstStep.treeChopFeePlanned,
		planting: firstStep.planting,
		duration: totalDuration,
		currentDate: firstStep.currentDate,
		type: 'Farming',
		autoFarmed: true,
		pid: firstStep.pid,
		autoFarmPlan,
		autoFarmCombined: true
	});

	const uniqueBoosts = [...new Set(plannedSteps.flatMap(step => step.boosts))];
	const summaryLines: string[] = [];
	const infoDetails: string[] = [];

	plannedSteps.forEach((step, index) => {
		const { summaryLine, extraInfoLines } = buildSummaryForStep(index, step);
		summaryLines.push(summaryLine);
		infoDetails.push(...extraInfoLines);
	});

	let response = `${user}, your minion is now taking around ${formatDuration(totalDuration)} to auto farm the following patches:\n${summaryLines.join('\n')}`;

	if (infoDetails.length > 0) {
		response += `

${infoDetails.join('\n')}`;
	}

	if (uniqueBoosts.length > 0) {
		response += `\n\n**Boosts**: ${uniqueBoosts.join(', ')}`;
	}
	if (skippedDueToTripLength) {
		response += `\n\nSome ready patches were skipped because the total trip length would exceed the maximum of ${formatDuration(
			maxTripLength
		)}.`;
	}

	return response;
}
