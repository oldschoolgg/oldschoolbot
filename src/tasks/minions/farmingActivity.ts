import { formatDuration } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { Farming } from '@/lib/skilling/skills/farming/index.js';
import type { AutoFarmSummary, FarmingActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { handleTripFinish as defaultHandleTripFinish } from '@/lib/util/handleTripFinish.js';
import { executeFarmingStep, type FarmingStepSummary } from './farmingStep.js';

function getPatchLabel(data: FarmingActivityTaskOptions): string {
	const patchType = data.patchType as Partial<typeof data.patchType> & { friendlyName?: string; patchName?: string };
	return data.patchName ?? patchType.friendlyName ?? patchType.patchName ?? 'patches';
}

function updateAutoFarmSummary({
	existingSummary,
	data,
	loot,
	stepSummary
}: {
	existingSummary: AutoFarmSummary | undefined;
	data: FarmingActivityTaskOptions;
	loot: Bank | null;
	stepSummary: FarmingStepSummary | undefined;
}): AutoFarmSummary {
	const baseSummary: AutoFarmSummary = existingSummary ?? {
		totalXP: 0,
		totalBonusXP: 0,
		totalWeeds: 0,
		totalDuration: 0,
		totalWoodcuttingXP: 0,
		totalHerbloreXP: 0,
		totalLoot: {},
		contractsCompleted: 0,
		boosts: [],
		steps: []
	};

	const xpTotal = stepSummary?.xp.totalFarming ?? 0;
	const bonusXP = stepSummary?.xp.bonus ?? 0;
	const woodcuttingXP = stepSummary?.xp.woodcutting ?? 0;
	const herbloreXP = stepSummary?.xp.herblore ?? 0;
	const duration = stepSummary?.duration ?? data.duration ?? 0;
	const weeds = loot?.amount('Weeds') ?? 0;
	const boosts = new Set(baseSummary.boosts);
	if (stepSummary?.boosts) {
		for (const boost of stepSummary.boosts) {
			boosts.add(boost);
		}
	}

	const lootBank = new Bank(baseSummary.totalLoot ?? {});
	if (loot) {
		lootBank.add(loot);
	}

	const stepQuantity =
		stepSummary?.harvested?.quantity ?? stepSummary?.planted?.quantity ?? data.quantity ?? baseSummary.steps.length;
	const plantsName =
		stepSummary?.planted?.itemName ?? stepSummary?.harvested?.itemName ?? data.plantsName ?? 'Unknown plant';

	return {
		totalXP: baseSummary.totalXP + xpTotal,
		totalBonusXP: baseSummary.totalBonusXP + bonusXP,
		totalWeeds: baseSummary.totalWeeds + weeds,
		totalDuration: baseSummary.totalDuration + duration,
		totalWoodcuttingXP: baseSummary.totalWoodcuttingXP + woodcuttingXP,
		totalHerbloreXP: baseSummary.totalHerbloreXP + herbloreXP,
		totalLoot: lootBank.toJSON(),
		contractsCompleted: baseSummary.contractsCompleted + (stepSummary?.contractCompleted ? 1 : 0),
		boosts: [...boosts],
		steps: [
			...baseSummary.steps,
			{
				patchType: getPatchLabel(data),
				plantsName,
				quantity: stepQuantity,
				xp: xpTotal,
				bonusXp: bonusXP,
				weeds,
				duration,
				loot: loot?.toJSON()
			}
		]
	};
}

function buildCombinedAutoFarmMessage(user: MUser, summary: AutoFarmSummary): string {
	const lines: string[] = [`${user}, ${user.minionName} finished auto farming your patches.`];
	if (summary.totalDuration > 0) {
		lines.push(`Total time spent: ${formatDuration(summary.totalDuration)}.`);
	}

	if (summary.steps.length > 0) {
		const stepDescriptions = summary.steps.map(step => {
			const patchLabel = step.patchType ? `${step.patchType}: ` : '';
			return `${patchLabel}${step.quantity.toLocaleString()}x ${step.plantsName}`;
		});
		lines.push(`Summary: ${stepDescriptions.join('; ')}.`);
	}

	const xpParts: string[] = [];
	if (summary.totalXP > 0) {
		xpParts.push(
			`${summary.totalXP.toLocaleString()} Farming XP (including ${summary.totalBonusXP.toLocaleString()} bonus XP)`
		);
	}
	if (summary.totalWoodcuttingXP > 0) {
		xpParts.push(`${summary.totalWoodcuttingXP.toLocaleString()} Woodcutting XP`);
	}
	if (summary.totalHerbloreXP > 0) {
		xpParts.push(`${summary.totalHerbloreXP.toLocaleString()} Herblore XP`);
	}
	if (xpParts.length > 0) {
		lines.push(`XP gained: ${xpParts.join(' | ')}.`);
	}

	if (summary.contractsCompleted > 0) {
		const suffix = summary.contractsCompleted === 1 ? '' : 's';
		lines.push(`Completed ${summary.contractsCompleted.toLocaleString()} farming contract${suffix}.`);
	}

	const totalLoot = new Bank(summary.totalLoot ?? {});
	if (summary.totalWeeds > 0 && totalLoot.amount('Weeds') === 0) {
		totalLoot.add('Weeds', summary.totalWeeds);
	}
	if (totalLoot.length > 0) {
		lines.push(`Total loot: ${totalLoot}.`);
	}

	if (summary.boosts.length > 0) {
		lines.push(`Boosts: ${summary.boosts.join(', ')}.`);
	}

	return lines.join('\n\n');
}

export const farmingTask: MinionTask = {
	type: 'Farming',
	async run(data: FarmingActivityTaskOptions, options) {
		const user = options?.user ?? (await mUserFetch(data.userID));
		const handleTripFinish = options?.handleTripFinish ?? defaultHandleTripFinish;
		const legacyChannelId = (data as { channelID?: string }).channelID;
		const channelId = data.channelId ?? legacyChannelId;
		if (!channelId) {
			throw new Error('Farming task completed without a channel id.');
		}
		const result = await executeFarmingStep({ user, channelID: channelId, data });
		if (!result) {
			return;
		}

		const combinedMode = Boolean(data.autoFarmCombined);
		const [nextStep, ...remainingSteps] = data.autoFarmPlan ?? [];
		const updatedSummary = combinedMode
			? updateAutoFarmSummary({
					existingSummary: data.autoFarmSummary,
					data,
					loot: result.loot ?? null,
					stepSummary: result.summary
				})
			: undefined;

		const scheduleNextStep = async (
			step: typeof nextStep,
			remaining: typeof remainingSteps,
			summaryToPass?: AutoFarmSummary
		) => {
			if (!step) return;
			let nextPid = step.pid;
			if (!nextPid && step.planting && step.plantsName) {
				const nextPlant = Farming.Plants.find(plant => plant.name === step.plantsName);
				if (nextPlant) {
					const inserted = await prisma.farmedCrop.create({
						data: {
							user_id: user.id,
							date_planted: new Date(step.currentDate),
							item_id: nextPlant.id,
							quantity_planted: step.quantity,
							was_autofarmed: true,
							paid_for_protection: step.payment ?? false,
							upgrade_type: step.upgradeType
						}
					});
					nextPid = inserted.id;
				}
			}
			const nextTask = {
				plantsName: step.plantsName,
				patchType: step.patchType,
				userID: user.id,
				channelId,
				quantity: step.quantity,
				upgradeType: step.upgradeType,
				payment: step.payment,
				treeChopFeePaid: step.treeChopFeePaid,
				treeChopFeePlanned: step.treeChopFeePlanned,
				planting: step.planting,
				duration: step.duration,
				currentDate: step.currentDate,
				type: 'Farming',
				autoFarmed: true,
				autoFarmPlan: remaining,
				autoFarmCombined: data.autoFarmCombined,
				autoFarmSummary: summaryToPass,
				patchName: step.patchName,
				pid: nextPid
			} satisfies Omit<FarmingActivityTaskOptions, 'finishDate' | 'id'>;
			await addSubTaskToActivityTask(nextTask);
		};

		if (combinedMode && nextStep) {
			await scheduleNextStep(nextStep, remainingSteps, updatedSummary);
			return;
		}

		const totalLoot = combinedMode && updatedSummary ? new Bank(updatedSummary.totalLoot ?? {}) : result.loot;
		const content =
			combinedMode && updatedSummary ? buildCombinedAutoFarmMessage(user, updatedSummary) : result.message;
		const message = result.attachment ? { content, files: [result.attachment] } : content;

		await handleTripFinish({
			user,
			channelId,
			message,
			data,
			loot: totalLoot && totalLoot.length > 0 ? totalLoot : null
		});

		if (!combinedMode && nextStep) {
			await scheduleNextStep(nextStep, remainingSteps);
		}
	}
};
