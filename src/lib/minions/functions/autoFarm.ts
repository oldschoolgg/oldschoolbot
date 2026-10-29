import { ButtonBuilder, ButtonStyle } from '@oldschoolgg/discord';
import { Emoji, formatDuration } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type { CropUpgradeType } from '@/prisma/main/enums.js';
import { AutoFarmFilterEnum } from '@/prisma/main/enums.js';
import { MessageBuilder } from '@/discord/MessageBuilder.js';
import { InteractionID } from '@/lib/InteractionID.js';
import { allFarm, replant } from '@/lib/minions/functions/autoFarmFilters.js';
import {
	buildAutoFarmPlan,
	buildFallbackPlantsByPatch,
	buildPlanRequests,
	buildSummaryForStep,
	type PlannedAutoFarmStep,
	selectCandidateForPatch,
	tryRepeatPreviousTrip
} from '@/lib/minions/functions/autoFarmHelpers.js';
import { getPlantsForPatch, parsePreferredSeeds } from '@/lib/skilling/skills/farming/autoFarm/preferences.js';
import { plants } from '@/lib/skilling/skills/farming/index.js';
import { formatFarmingBoosts, formatItemsUsed } from '@/lib/skilling/skills/farming/utils/farmingFormatters.js';
import type { FarmingPatchName } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type { IPatchData, IPatchDataDetailed } from '@/lib/skilling/skills/farming/utils/types.js';
import type { AutoFarmStepData, FarmingActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { formatTripDuration } from '@/lib/util/minionUtils.js';

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
	blockedResponse: Awaited<CommandResponse> | null;
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
	const fallbackPlantsByPatch = buildFallbackPlantsByPatch(eligiblePlants, patchesByName);

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

		if (selection.blockedResponse) {
			const autoFarmPlan = buildAutoFarmPlan(plannedSteps, Date.now());
			return {
				plannedSteps,
				totalDuration: selection.updatedTotalDuration,
				totalCost,
				maxTripLength,
				skippedDueToTripLength: skippedDueToTripLength || selection.skippedDueToTripLength,
				skippedPatchNamesDueToTripLength: [...skippedPatchNamesDueToTripLength],
				firstPrepareError,
				errorString,
				autoFarmPlan,
				blockedResponse: selection.blockedResponse
			};
		}

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
		autoFarmPlan,
		blockedResponse: null
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
		autoFarmPlan,
		blockedResponse
	} = planning;

	if (blockedResponse) {
		return blockedResponse;
	}

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
