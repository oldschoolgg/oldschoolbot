import { SpecialResponse } from '@oldschoolgg/discord';
import { formatDuration } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type { CropUpgradeType } from '@/prisma/main/enums.js';
import { activity_type_enum } from '@/prisma/main/enums.js';
import { resolveSeedForPatch } from '@/lib/skilling/skills/farming/autoFarm/preferences.js';
import type { FarmingPatchName } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type {
	FarmingSeedPreference,
	IPatchData,
	IPatchDataDetailed
} from '@/lib/skilling/skills/farming/utils/types.js';
import type { Plant } from '@/lib/skilling/types.js';
import type { AutoFarmStepData } from '@/lib/types/minions.js';
import { fetchRepeatTrips, repeatTrip } from '@/lib/util/repeatStoredTrip.js';
import { prepareFarmingStep } from './farmingTripHelpers.js';

export interface PlannedAutoFarmStep {
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

export interface PlanRequest {
	type: 'highest' | 'plant';
	patch: IPatchDataDetailed;
	plant?: Plant;
}

export interface BuildSummaryResult {
	summaryLine: string;
	extraInfoLines: string[];
}

interface CandidateEvaluationResult {
	success: boolean;
	error?: string;
	blockedResponse?: Awaited<CommandResponse>;
	plannedStep?: PlannedAutoFarmStep;
	updatedTotalDuration?: number;
	skippedTripLength?: boolean;
}

export function shouldHideInfoLine(line: string): boolean {
	const normalized = line.toLowerCase();
	return (
		normalized.startsWith('you are treating your patches with') ||
		normalized.startsWith('you are paying a nearby farmer') ||
		normalized.startsWith('you may need to pay a nearby farmer')
	);
}

export function buildSummaryForStep(index: number, step: PlannedAutoFarmStep): BuildSummaryResult {
	const extraInfoLines = step.info
		.filter(infoLine => !shouldHideInfoLine(infoLine))
		.map(infoLine => `${step.friendlyName}: ${infoLine}`);

	return {
		summaryLine: `${index + 1}. ${step.friendlyName}: ${step.quantity.toLocaleString()}x ${step.plant.name}`,
		extraInfoLines
	};
}

export function buildPlanRequests({
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

export function buildAutoFarmPlan(plannedSteps: PlannedAutoFarmStep[], planningStartTime: number): AutoFarmStepData[] {
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

export function buildFallbackPlantsByPatch(
	eligiblePlants: Plant[],
	patchesByName: Map<FarmingPatchName, IPatchDataDetailed>
): Map<FarmingPatchName, Plant> {
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
	return fallbackPlantsByPatch;
}

export async function tryRepeatPreviousTrip({
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

export async function evaluateCandidateForPatch({
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
		if (prepared.reason === 'missing_compost') {
			return {
				success: false,
				error: prepared.error,
				blockedResponse: { content: prepared.error, allowedMentions: { users: [user.id] } }
			};
		}
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

export async function selectCandidateForPatch({
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
}): Promise<{
	planned: boolean;
	updatedTotalDuration: number;
	firstError: string | null;
	skippedDueToTripLength: boolean;
	blockedResponse: Awaited<CommandResponse> | null;
}> {
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
			if (result.blockedResponse) {
				return {
					planned,
					updatedTotalDuration: currentTotalDuration,
					firstError: errorsForPatch[0] ?? null,
					skippedDueToTripLength: skippedThisPatch,
					blockedResponse: result.blockedResponse
				};
			}
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
		skippedDueToTripLength: skippedThisPatch,
		blockedResponse: null
	};
}
