import type { BaseSendableMessage } from '@oldschoolgg/discord';
import { Time } from '@oldschoolgg/toolkit';
import { Bank, toKMB } from 'oldschooljs';

import { BitField } from '@/lib/constants.js';
import { skillEmoji } from '@/lib/data/emojis.js';
import type { FarmingActivityTaskOptions } from '@/lib/types/minions.js';
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
	totalLoot: Bank;
	user: MUser;
}

function formatList(parts: string[]): string {
	if (parts.length === 0) return '';
	if (parts.length === 1) return parts[0];
	if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
	return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
}

function calcPerHour(amount: number, totalDuration: number): string {
	if (amount <= 0 || totalDuration <= 0) {
		return '';
	}
	const perHour = Math.floor((amount / (totalDuration / Time.Minute)) * 60);
	const rounded = Math.floor(perHour / 1000) * 1000;
	return rounded > 0 ? ` (${toKMB(rounded)}/Hr)` : '';
}

function buildAggregateMessage({ summaries, totalLoot, user }: BuildAggregateMessageArgs): string | null {
	if (summaries.length === 0) {
		return null;
	}

	const plantedOrder: string[] = [];
	const plantedTotals = new Map<string, number>();
	const harvestedOrder: string[] = [];
	const harvestedTotals = new Map<string, { quantity: number; alive: number; died: number }>();
	let totalDuration = 0;
	let farmingXP = 0;
	let woodcuttingXP = 0;
	let herbloreXP = 0;
	const boosts = new Set<string>();
	let contractsCompleted = 0;
	const payNotes: string[] = [];
	const payNotesSeen = new Set<string>();
	const xpNoticesBySkill = new Map<string, string>();

	for (const summary of summaries) {
		if (summary.planted) {
			const current = plantedTotals.get(summary.planted.itemName) ?? 0;
			if (!plantedTotals.has(summary.planted.itemName)) {
				plantedOrder.push(summary.planted.itemName);
			}
			plantedTotals.set(summary.planted.itemName, current + summary.planted.quantity);
		}

		if (summary.harvested) {
			const current = harvestedTotals.get(summary.harvested.itemName);
			if (!current) {
				harvestedOrder.push(summary.harvested.itemName);
				harvestedTotals.set(summary.harvested.itemName, {
					quantity: summary.harvested.quantity,
					alive: summary.harvested.alive,
					died: summary.harvested.died
				});
			} else {
				current.quantity += summary.harvested.quantity;
				current.alive += summary.harvested.alive;
				current.died += summary.harvested.died;
			}
		}

		totalDuration += summary.duration ?? 0;
		farmingXP += summary.xp.totalFarming;
		woodcuttingXP += summary.xp.woodcutting;
		herbloreXP += summary.xp.herblore;

		if (summary.payNote && !payNotesSeen.has(summary.payNote)) {
			payNotesSeen.add(summary.payNote);
			payNotes.push(summary.payNote);
		}

		for (const [skill, message] of Object.entries(summary.xpMessages)) {
			if (!message) continue;
			let latestLine: string | null = null;
			for (const rawLine of message.split('\n')) {
				const line = rawLine.trim();
				if (!line) continue;
				if (line.startsWith('You received') || line.startsWith('+')) {
					continue;
				}
				latestLine = line;
			}
			if (!latestLine) continue;
			xpNoticesBySkill.set(skill, latestLine);
		}

		if (summary.boosts) {
			for (const boost of summary.boosts) {
				boosts.add(boost);
			}
		}

		if (summary.contractCompleted) {
			contractsCompleted += 1;
		}
	}

	const lines: string[] = [`${user}, ${user.minionName} finished auto farming your patches.`];

	if (plantedOrder.length > 0) {
		const plantedParts = plantedOrder.map(name => `${plantedTotals.get(name)!.toLocaleString()}x ${name}`);
		lines.push(`Your minion planted ${formatList(plantedParts)}.`);
	}

	if (harvestedOrder.length > 0) {
		const harvestedParts = harvestedOrder.map(name => {
			const data = harvestedTotals.get(name)!;
			const status =
				data.died > 0 ? ` (${data.alive.toLocaleString()} alive, ${data.died.toLocaleString()} died)` : '';
			return `${data.quantity.toLocaleString()}x ${name}${status}`;
		});
		lines.push(`You harvested ${formatList(harvestedParts)}.`);
	}

	const xpParts: string[] = [];
	if (farmingXP > 0) {
		xpParts.push(`${farmingXP.toLocaleString()} ${skillEmoji.farming} XP${calcPerHour(farmingXP, totalDuration)}`);
	}
	if (woodcuttingXP > 0) {
		xpParts.push(
			`${woodcuttingXP.toLocaleString()} ${skillEmoji.woodcutting} XP${calcPerHour(woodcuttingXP, totalDuration)}`
		);
	}
	if (herbloreXP > 0) {
		xpParts.push(
			`${herbloreXP.toLocaleString()} ${skillEmoji.herblore} XP${calcPerHour(herbloreXP, totalDuration)}`
		);
	}
	if (xpParts.length > 0) {
		lines.push(`You received ${formatList(xpParts)}.`);
	}

	if (boosts.size > 0) {
		lines.push(`**Boosts:** ${Array.from(boosts).join(', ')}.`);
	}

	if (contractsCompleted > 0) {
		const suffix = contractsCompleted === 1 ? '' : 's';
		lines.push(`Completed ${contractsCompleted.toLocaleString()} farming contract${suffix}.`);
	}

	if (totalLoot.length > 0) {
		lines.push(`You received: ${totalLoot}.`);
	}

	if (payNotes.length > 0) {
		lines.push(payNotes.join('\n'));
	}
	const xpNotices: string[] = [];
	const xpNoticesSeen = new Set<string>();
	for (const line of xpNoticesBySkill.values()) {
		if (xpNoticesSeen.has(line)) continue;
		xpNoticesSeen.add(line);
		xpNotices.push(line);
	}

	if (xpNotices.length > 0) {
		lines.push(xpNotices.join('\n'));
	}

	return lines.join('\n\n').replace(/:minion:\s+:minion:\s*/gi, ':minion: ');
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

	const aggregatedContent =
		summaries.length === messages.length ? buildAggregateMessage({ summaries, totalLoot, user }) : null;
	const content = aggregatedContent ?? messages.join('\n\n');
	const message: BaseSendableMessage = { content };

	if (attachments.length > 0) {
		message.files = attachments;
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
		message.components = extraComponents;
	}

	await handleTripFinish({
		user,
		channelId: baseChannelId,
		message,
		data: taskData,
		loot
	});
}
