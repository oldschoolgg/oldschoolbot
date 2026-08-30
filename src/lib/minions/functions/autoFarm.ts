import { ButtonBuilder, ButtonStyle, SpecialResponse } from '@oldschoolgg/discord';
import { Emoji, formatDuration } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type { CropUpgradeType } from '@/prisma/main/enums.js';
import { AutoFarmFilterEnum, activity_type_enum } from '@/prisma/main/enums.js';
import { MessageBuilder } from '@/discord/MessageBuilder.js';
import { InteractionID } from '@/lib/InteractionID.js';
import { allFarm, replant } from '@/lib/minions/functions/autoFarmFilters.js';
import {
	getPlantsForPatch,
	parsePreferredSeeds,
	resolveSeedForPatch
} from '@/lib/skilling/skills/farming/autoFarm/preferences.js';
import { plants } from '@/lib/skilling/skills/farming/index.js';
import { formatFarmingBoosts, formatItemsUsed } from '@/lib/skilling/skills/farming/utils/farmingFormatters.js';
import type { FarmingPatchName } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type {
	FarmingSeedPreference,
	IPatchData,
	IPatchDataDetailed
} from '@/lib/skilling/skills/farming/utils/types.js';
import type { Plant } from '@/lib/skilling/types.js';
import type { AutoFarmStepData, FarmingActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';
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

interface PlanRequest {
	type: 'highest' | 'plant';
	patch: IPatchDataDetailed;
	plant?: Plant;
}

interface BuildSummaryResult {
	summaryLine: string;
	extraInfoLines: string[];
}

interface CandidateEvaluationResult {
	success: boolean;
	error?: string;
	plannedStep?: PlannedAutoFarmStep;
	updatedTotalDuration?: number;
	skippedTripLength?: boolean;
}

export interface PrepareAutoFarmResult {
	plannedSteps: PlannedAutoFarmStep[];
	totalDuration: number;
	totalCost: Bank;
	maxTripLength: number;
	skippedDueToTripLength: boolean;
	skippedPatchNamesDueToTripLength: string[];
	firstPrepareError: string | null;
	errorString: string;
	autoFarmPlan: AutoFarmStepData[];
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
	const extraInfoLines = step.info
		.filter(infoLine => !shouldHideInfoLine(infoLine))
		.map(infoLine => `${step.friendlyName}: ${infoLine}`);

	return {
		summaryLine: `${index + 1}. ${step.friendlyName}: ${step.quantity.toLocaleString()}x ${step.plant.name}`,
		extraInfoLines
	};
}

function buildPlanRequests({
	patchesDetailed,
	preferredSeeds,
	preferContract,
	hasActiveContract,
	contractPlant,
	fallbackPlantsByPatch
}: {
	patchesDetailed: IPatchDataDetailed[];
	preferredSeeds: Map<FarmingPatchName, FarmingSeedPreference>;
	preferContract: boolean;
	hasActiveContract: boolean;
	contractPlant: Plant | null | undefined;
	fallbackPlantsByPatch: Map<FarmingPatchName, Plant>;
}): PlanRequest[] {
	const planRequests: PlanRequest[] = [];
	for (const patch of patchesDetailed) {
		const resolved = resolveSeedForPatch({
			patch,
			preferContract,
			hasActiveContract,
			contractPlant: contractPlant ?? null,
			preferences: preferredSeeds,
			fallbackPlant: fallbackPlantsByPatch.get(patch.patchName) ?? null
		});

		if (!resolved) {
			continue;
		}

		if (resolved.type === 'plant') {
			const planRequest: PlanRequest = { type: 'plant', patch, plant: resolved.plant };
			if (resolved.reason === 'contract') {
				planRequests.unshift(planRequest);
			} else {
				planRequests.push(planRequest);
			}
			continue;
		}

		planRequests.push({ type: 'highest', patch });
	}

	return planRequests;
}

function buildAutoFarmPlan(plannedSteps: PlannedAutoFarmStep[], planningStartTime: number): AutoFarmStepData[] {
	const autoFarmPlan: AutoFarmStepData[] = [];
	let accumulatedDuration = 0;
	for (const step of plannedSteps) {
		autoFarmPlan.push({
			plantsName: step.plant.name,
			quantity: step.quantity,
			upgradeType: step.upgradeType,
			patchName: step.patchName,
			payment: step.didPay,
			treeChopFeePaid: step.treeChopFee,
			treeChopFeePlanned: step.treeChopFee,
			patchType: step.patch,
			planting: true,
			currentDate: planningStartTime + accumulatedDuration,
			duration: step.duration
		});
		accumulatedDuration += step.duration;
	}
	return autoFarmPlan;
}

async function tryRepeatPreviousTrip({
	user,
	interaction,
	errorString
}: {
	user: MUser;
	interaction: MInteraction;
	errorString: string;
}): Promise<CommandResponse | null> {
	try {
		const repeatableTrips = await fetchRepeatTrips(user);
		const fallbackTrip = repeatableTrips.find(trip => trip.type !== activity_type_enum.Farming);
		if (!fallbackTrip) {
			return null;
		}
		const response = await repeatTrip(user, interaction as OSInteraction, fallbackTrip);
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

async function evaluateCandidateForPatch({
	user,
	candidate,
	patch,
	maxTripLength,
	remainingBank,
	totalDuration,
	totalCost,
	compostTier,
	patches
}: {
	user: MUser;
	candidate: Plant;
	patch: IPatchDataDetailed;
	maxTripLength: number;
	remainingBank: Bank;
	totalDuration: number;
	totalCost: Bank;
	compostTier: CropUpgradeType;
	patches: Record<FarmingPatchName, IPatchData>;
}): Promise<CandidateEvaluationResult> {
	const prepared = await prepareFarmingStep({
		user,
		plant: candidate,
		quantity: null,
		pay: false,
		patchDetailed: patch,
		maxTripLength,
		availableBank: remainingBank,
		compostTier
	});
	if (!prepared.success) {
		return { success: false, error: prepared.error };
	}

	const { quantity, duration, cost, upgradeType, didPay, infoStr, boostStr, treeChopFee } = prepared.data;
	if (quantity <= 0 || duration <= 0) {
		return { success: false };
	}
	if (duration > maxTripLength) {
		return {
			success: false,
			error: `${user.minionName} can't go on trips longer than ${formatDuration(maxTripLength)}.`
		};
	}
	const totalCoinCost = cost.amount('Coins') + treeChopFee;
	if (totalCoinCost > 0 && remainingBank.amount('Coins') < totalCoinCost) {
		return { success: false, error: `You don't own ${new Bank().add('Coins', totalCoinCost)}.` };
	}
	if (!remainingBank.has(cost)) {
		return { success: false, error: `You don't own ${cost}.` };
	}
	if (totalDuration + duration > maxTripLength) {
		return {
			success: false,
			skippedTripLength: true
		};
	}
	const patchData = patches[patch.patchName];
	if (!patchData) {
		return { success: false, error: `Unable to resolve patch data for ${patch.friendlyName}.` };
	}

	remainingBank.remove(cost);
	if (treeChopFee > 0) {
		const treeFeeBank = new Bank().add('Coins', treeChopFee);
		remainingBank.remove(treeFeeBank);
		totalCost.add(treeFeeBank);
	}
	totalCost.add(cost);
	const updatedTotalDuration = totalDuration + duration;
	return {
		success: true,
		plannedStep: {
			plant: candidate,
			quantity,
			duration,
			upgradeType,
			didPay,
			treeChopFee,
			patch: patchData,
			patchName: patch.patchName,
			friendlyName: patch.friendlyName,
			info: infoStr,
			boosts: boostStr
		},
		updatedTotalDuration
	};
}

async function selectCandidateForPatch({
	user,
	patch,
	candidates,
	maxTripLength,
	remainingBank,
	totalDuration,
	totalCost,
	compostTier,
	patches,
	skippedPatchNamesDueToTripLength,
	plannedSteps
}: {
	user: MUser;
	patch: IPatchDataDetailed;
	candidates: Plant[];
	maxTripLength: number;
	remainingBank: Bank;
	totalDuration: number;
	totalCost: Bank;
	compostTier: CropUpgradeType;
	patches: Record<FarmingPatchName, IPatchData>;
	skippedPatchNamesDueToTripLength: Set<string>;
	plannedSteps: PlannedAutoFarmStep[];
}): Promise<{ planned: boolean; updatedTotalDuration: number; firstError: string | null; skippedDueToTripLength: boolean }> {
	let planned = false;
	let currentTotalDuration = totalDuration;
	let skippedThisPatch = false;
	const errorsForPatch: string[] = [];

	for (const candidate of candidates) {
		const result = await evaluateCandidateForPatch({
			user,
			candidate,
			patch,
			maxTripLength,
			remainingBank,
			totalDuration: currentTotalDuration,
			totalCost,
			compostTier,
			patches
		});
		if (!result.success) {
			if (result.skippedTripLength) {
				skippedThisPatch = true;
				skippedPatchNamesDueToTripLength.add(patch.friendlyName);
				continue;
			}
			if (result.error) {
				errorsForPatch.push(result.error);
			}
			continue;
		}
		if (result.plannedStep) {
			plannedSteps.push(result.plannedStep);
			planned = true;
			currentTotalDuration = result.updatedTotalDuration ?? currentTotalDuration;
			break;
		}
	}

	return {
		planned,
		updatedTotalDuration: currentTotalDuration,
		firstError: errorsForPatch[0] ?? null,
		skippedDueToTripLength: skippedThisPatch
	};
}

export async function planAutoFarmTrip(
	user: MUser,
	patchesDetailed: IPatchDataDetailed[],
	patches: Record<FarmingPatchName, IPatchData>
): Promise<PrepareAutoFarmResult> {
	const farmingLevel = user.skillsAsLevels.farming;
	const autoFarmFilter = user.autoFarmFilter ?? AutoFarmFilterEnum.AllFarm;
	const preferContract = Boolean(user.user.minion_farmingPreferredContract);
	const preferredSeeds = parsePreferredSeeds(user.user.minion_farmingPreferredSeeds);
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

	const maxTripLength = await calcMaxTripLength(user, 'Farming');
	const compostTier = ((user.user.minion_defaultCompostToUse as CropUpgradeType) ?? 'compost') as CropUpgradeType;

	const plannedSteps: PlannedAutoFarmStep[] = [];
	let totalDuration = 0;
	const totalCost = new Bank();
	const remainingBank = baseBank.clone();
	let skippedDueToTripLength = false;
	const skippedPatchNamesDueToTripLength = new Set<string>();

	const hasPreferenceInfluence = preferContract || preferredSeeds.size > 0;
	let errorString =
		autoFarmFilter === AutoFarmFilterEnum.AllFarm
			? "There's no Farming crops that you have the requirements to plant, and nothing to harvest."
			: "There's no Farming crops that you have planted that are ready to be replanted or no seeds remaining.";
	if (hasPreferenceInfluence) {
		errorString = "There's no Farming actions available for your saved preferences.";
	}

	let firstPrepareError: string | null = null;

	const patchesByName = new Map<FarmingPatchName, IPatchDataDetailed>(
		patchesDetailed.map(patch => [patch.patchName, patch])
	);
	const fallbackPlantsByPatch = new Map<FarmingPatchName, Plant>();
	for (const plant of eligiblePlants) {
		const patchName = plant.seedType as FarmingPatchName;
		if (fallbackPlantsByPatch.has(patchName)) {
			continue;
		}
		const patch = patchesByName.get(patchName);
		if (!patch || patch.ready === false) {
			continue;
		}
		fallbackPlantsByPatch.set(patchName, plant);
	}

	const contract = user.farmingContract();
	const hasActiveContract = Boolean(contract.contract?.hasContract);
	const contractPlant =
		hasActiveContract && contract.contract?.plantToGrow
			? (contract.plant ??
				(contract.contract?.plantToGrow ? plants.find(pl => pl.name === contract.contract?.plantToGrow) : null))
			: null;

	const planRequests = buildPlanRequests({
		patchesDetailed,
		preferredSeeds,
		preferContract,
		hasActiveContract,
		contractPlant: contractPlant ?? null,
		fallbackPlantsByPatch
	});

	for (const request of planRequests) {
		const patch = request.patch;
		const candidates =
			request.type === 'highest' ? getPlantsForPatch(patch.patchName) : request.plant ? [request.plant] : [];
		const levelEligibleCandidates = candidates.filter(candidate => candidate.level <= farmingLevel);
		if (levelEligibleCandidates.length === 0) {
			continue;
		}

		const selection = await selectCandidateForPatch({
			user,
			patch,
			candidates: levelEligibleCandidates,
			maxTripLength,
			remainingBank,
			totalDuration,
			totalCost,
			compostTier,
			patches,
			skippedPatchNamesDueToTripLength,
			plannedSteps
		});

		totalDuration = selection.updatedTotalDuration;
		skippedDueToTripLength = skippedDueToTripLength || selection.skippedDueToTripLength;
		if (!selection.planned && selection.firstError && !firstPrepareError) {
			firstPrepareError = selection.firstError;
		}
	}

	const autoFarmPlan = buildAutoFarmPlan(plannedSteps, Date.now());

	return {
		plannedSteps,
		totalDuration,
		totalCost,
		maxTripLength,
		skippedDueToTripLength,
		skippedPatchNamesDueToTripLength: [...skippedPatchNamesDueToTripLength],
		firstPrepareError,
		errorString,
		autoFarmPlan
	};
}

export async function autoFarm(
	user: MUser,
	patchesDetailed: IPatchDataDetailed[],
	patches: Record<FarmingPatchName, IPatchData>,
	interaction: MInteraction
) {
	if (await user.minionIsBusy()) {
		return 'Your minion must not be busy to use this command.';
	}

	const planning = await planAutoFarmTrip(user, patchesDetailed, patches);
	const {
		plannedSteps,
		totalDuration,
		totalCost,
		maxTripLength,
		skippedDueToTripLength,
		skippedPatchNamesDueToTripLength,
		firstPrepareError,
		errorString,
		autoFarmPlan
	} = planning;

	if (plannedSteps.length === 0) {
		if (firstPrepareError !== null) {
			return firstPrepareError;
		}

		const checkPatchesButton = new ButtonBuilder()
			.setCustomId(InteractionID.Commands.CheckPatches)
			.setLabel('Check Patches')
			.setEmoji({ name: Emoji.Stopwatch })
			.setStyle(ButtonStyle.Secondary);

		const components: ButtonBuilder[] = [checkPatchesButton];

		const noCropsResponse = new MessageBuilder().setContent(errorString).addComponents(components);

		const repeated = await tryRepeatPreviousTrip({ user, interaction, errorString });
		if (repeated !== null) {
			return repeated;
		}

		return noCropsResponse;
	}

	const firstStep = autoFarmPlan[0];
	if (!firstStep) {
		return errorString;
	}

	const channelId = interaction.channelId;
	const firstTask = {
		userID: user.id,
		type: 'Farming',
		duration: totalDuration,
		channelId,
		plantsName: firstStep.plantsName,
		patchType: firstStep.patchType,
		quantity: firstStep.quantity,
		upgradeType: firstStep.upgradeType,
		payment: firstStep.payment,
		treeChopFeePaid: firstStep.treeChopFeePaid,
		treeChopFeePlanned: firstStep.treeChopFeePlanned,
		planting: firstStep.planting,
		autoFarmed: true,
		autoFarmCombined: autoFarmPlan.length > 1,
		autoFarmPlan,
		currentDate: firstStep.currentDate,
		patchName: firstStep.patchName
	} satisfies Omit<FarmingActivityTaskOptions, 'finishDate' | 'id'>;

	let chargedCost = false;
	try {
		if (!user.owns(totalCost)) {
			return `You don't own ${totalCost}.`;
		}
		if (totalCost.length > 0) {
			await user.transactItems({ itemsToRemove: totalCost });
			chargedCost = true;
		}
		await addSubTaskToActivityTask(firstTask);
	} catch (err) {
		const startFailContext = { type: 'AUTO_FARM_START_FAIL', user_id: user.id, charged_cost: chargedCost };
		if ((globalThis as { prisma?: unknown }).prisma) {
			Logging.logError(err as Error, startFailContext);
		} else {
			Logging.logDebug(`AutoFarm failed to start for ${user.id}: ${(err as Error).message}`, startFailContext);
		}
		if (chargedCost && totalCost.length > 0) {
			try {
				await user.transactItems({ itemsToAdd: totalCost });
			} catch (refundErr) {
				Logging.logError(refundErr as Error);
			}
		}
		if (err instanceof Error) {
			return err.message;
		}
		return 'There was an error starting your activity.';
	}
	await ClientSettings.updateBankSetting('farming_cost_bank', totalCost);
	await user.statsBankUpdate('farming_plant_cost_bank', totalCost);

	const uniqueBoosts = [...new Set(plannedSteps.flatMap(step => step.boosts))];
	const summaryLines: string[] = [];
	const infoDetails: string[] = [];

	plannedSteps.forEach((step, index) => {
		const { summaryLine, extraInfoLines } = buildSummaryForStep(index, step);
		summaryLines.push(summaryLine);
		infoDetails.push(...extraInfoLines);
	});

	const patchGroupCount = summaryLines.length;
	let response = `${user.minionName} is now auto farming ${patchGroupCount.toLocaleString()} patch group${
		patchGroupCount === 1 ? '' : 's'
	}, the trip will return in about ${formatTripDuration(
		user,
		totalDuration
	)}:\n\n**Patches:**\n${summaryLines.join('\n')}`;

	const itemsUsed = formatItemsUsed(totalCost);
	if (itemsUsed.length > 0) {
		response += `\n\n${itemsUsed}`;
	}

	if (infoDetails.length > 0) {
		response += `

${infoDetails.join('\n')}`;
	}

	response += formatFarmingBoosts(uniqueBoosts, { label: '**Boosts**:', suffix: '' });
	if (skippedDueToTripLength) {
		const skippedPatches = skippedPatchNamesDueToTripLength;
		const skippedPatchStr =
			skippedPatches.length > 0
				? `Skipped due to trip length: ${skippedPatches.join(', ')}.`
				: 'Some ready patches were skipped.';
		response += `\n\n${skippedPatchStr} Your maximum trip length is ${formatDuration(maxTripLength)}.`;
	}

	return response;
}
