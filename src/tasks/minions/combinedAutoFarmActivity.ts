import type { BaseSendableMessage } from '@oldschoolgg/discord';
import { formatDuration } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { BitField } from '@/lib/constants.js';
import type { AutoFarmStepData, FarmingActivityTaskOptions } from '@/lib/types/minions.js';
import { handleTripFinish as defaultHandleTripFinish } from '@/lib/util/handleTripFinish.js';
import { makeAutoContractButton } from '@/lib/util/interactions.js';
import { canRunAutoContract } from '@/mahoji/lib/abstracted_commands/farmingContractCommand.js';
import {
	executeFarmingStep,
	type FarmingStepAttachment,
	type FarmingStepSummary
} from '@/tasks/minions/farmingStep.js';

interface HandleCombinedAutoFarmOptions {
	user: MUser;
	taskData: FarmingActivityTaskOptions;
	handleTripFinish?: typeof defaultHandleTripFinish;
}

interface BuildAggregateMessageArgs {
	summaries: FarmingStepSummary[];
	steps: AutoFarmStepData[];
}

function getPatchLabel(step: AutoFarmStepData): string {
	const patchType = step.patchType as Partial<AutoFarmStepData['patchType']> & {
		friendlyName?: string;
		patchName?: string;
	};
	return step.patchName ?? patchType.friendlyName ?? patchType.patchName ?? 'patch';
}

function buildAggregateMessage({ summaries, steps }: BuildAggregateMessageArgs): string | null {
	if (summaries.length === 0) {
		return null;
	}

	let totalDuration = 0;
	let farmingXP = 0;
	let woodcuttingXP = 0;
	const boosts = new Set<string>();

	for (const summary of summaries) {
		totalDuration += summary.duration ?? 0;
		farmingXP += summary.xp.totalFarming;
		woodcuttingXP += summary.xp.woodcutting;
	}

	for (const summary of summaries) {
		if (!summary.boosts) continue;

		for (const boost of summary.boosts) {
			boosts.add(boost);
		}
	}

	const totalDurationFormatted = formatDuration(totalDuration);
	const bonusXP = summaries.reduce((total, summary) => total + summary.xp.bonus, 0);
	const patchSummaryParts = steps.map(step => {
		const plantName = step.plantsName ?? 'Unknown plant';
		return `${getPatchLabel(step)}: ${step.quantity.toLocaleString()}x ${plantName}`;
	});
	const patchSummaryShort = patchSummaryParts.length > 0 ? patchSummaryParts.join(' • ') : 'None';
	const boostSummary = boosts.size > 0 ? Array.from(boosts).join(', ') : 'None';

	const lines = [
		`Auto-farm complete (${totalDurationFormatted})`,
		`XP: ${farmingXP.toLocaleString()} Farming (${bonusXP.toLocaleString()} bonus) • ${woodcuttingXP.toLocaleString()} WC`,
		`Patches: ${patchSummaryShort}`,
		`Boosts: ${boostSummary}`,
		'Loot:'
	];

	return lines.join('\n');
}
export async function handleCombinedAutoFarm({
	user,
	taskData,
	handleTripFinish = defaultHandleTripFinish
}: HandleCombinedAutoFarmOptions) {
	const plan = taskData.autoFarmPlan;
	const steps =
		plan && plan.length > 0
			? plan
			: [
					{
						plantsName: taskData.plantsName,
						quantity: taskData.quantity,
						upgradeType: taskData.upgradeType,
						payment: taskData.payment,
						treeChopFeePaid: taskData.treeChopFeePaid,
						treeChopFeePlanned: taskData.treeChopFeePlanned,
						patchType: taskData.patchType,
						planting: taskData.planting,
						currentDate: taskData.currentDate,
						pid: taskData.pid,
						duration: taskData.duration
					}
				];

	const legacyChannelId = (taskData as { channelID?: string }).channelID;
	const baseChannelId = taskData.channelId ?? legacyChannelId;
	if (!baseChannelId) {
		throw new Error('Farming auto farm task missing channel id.');
	}

	const messages: string[] = [];
	const attachments: FarmingStepAttachment[] = [];
	const totalLoot = new Bank();
	const summaries: FarmingStepSummary[] = [];
	let handledAny = false;

	for (const step of steps) {
		const stepData: FarmingActivityTaskOptions = {
			...taskData,
			channelId: baseChannelId,
			plantsName: step.plantsName,
			quantity: step.quantity,
			upgradeType: step.upgradeType,
			payment: step.payment,
			treeChopFeePaid: step.treeChopFeePaid,
			treeChopFeePlanned: step.treeChopFeePlanned,
			patchType: step.patchType,
			planting: step.planting,
			currentDate: step.currentDate,
			duration: step.duration,
			pid: step.pid,
			autoFarmPlan: undefined,
			autoFarmCombined: false
		};

		const result = await executeFarmingStep({ user, channelID: baseChannelId, data: stepData });
		if (!result) {
			break;
		}

		handledAny = true;
		messages.push(result.message);
		if (result.summary) {
			summaries.push(result.summary);
		}
		if (result.attachment) {
			attachments.push(result.attachment);
		}
		if (result.loot) {
			totalLoot.add(result.loot);
		}
	}

	if (!handledAny) {
		return;
	}

	const aggregatedContent = summaries.length === messages.length ? buildAggregateMessage({ summaries, steps }) : null;
	const content = aggregatedContent ?? messages.join('\n\n');
	let message: InstanceType<typeof MessageBuilder> | BaseSendableMessage = aggregatedContent
		? new MessageBuilder().setContent(content).addBankImage({ bank: totalLoot })
		: { content };

	if (attachments.length > 0) {
		if (message instanceof MessageBuilder) {
			for (const attachment of attachments) {
				message.addFile(attachment);
			}
		} else {
			message.files = attachments;
		}
	}

	const loot = totalLoot.length > 0 ? totalLoot : null;
	let extraComponents: ReturnType<typeof makeAutoContractButton>[] | undefined;
	const completedContract = summaries.some(summary => summary.contractCompleted) && (loot?.has('Seed pack') ?? false);
	if (completedContract) {
		const autoContractDisabled = user.bitfield.includes(BitField.DisableAutoFarmContractButton);
		if (!autoContractDisabled) {
			const canAutoContractNow = await canRunAutoContract(user);
			const autoContractButton = makeAutoContractButton();
			if (!canAutoContractNow) {
				autoContractButton.setLabel('Auto Farming Contract (Unlock requirements pending)').setDisabled(true);
			}
			extraComponents = [autoContractButton];
		}
	}

	if (extraComponents?.length) {
		if (message instanceof MessageBuilder) {
			message.addComponents(extraComponents);
		} else {
			message.components = extraComponents;
		}
	}

	await handleTripFinish({
		user,
		channelId: baseChannelId,
		message,
		data: taskData,
		loot
	});
}
