import { Time } from '@oldschoolgg/toolkit';
import { Bank, toKMB } from 'oldschooljs';

import { skillEmoji } from '@/lib/data/emojis.js';
import type { FarmingActivityTaskOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { executeFarmingStep, type FarmingStepAttachment, type FarmingStepSummary } from './farmingStep.js';

interface HandleCombinedAutoFarmOptions {
	user: MUser;
	taskData: FarmingActivityTaskOptions;
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
	const payNotes: string[] = [];
	const payNotesSeen = new Set<string>();
	const xpNotices: string[] = [];
	const xpNoticesSeen = new Set<string>();

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

		for (const message of Object.values(summary.xpMessages)) {
			if (!message) continue;
			for (const rawLine of message.split('\n')) {
				const line = rawLine.trim();
				if (!line) continue;
				if (line.startsWith('You received') || line.startsWith('+')) {
					continue;
				}
				if (xpNoticesSeen.has(line)) continue;
				xpNoticesSeen.add(line);
				xpNotices.push(line);
			}
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

	if (totalLoot.length > 0) {
		lines.push(`You received: ${totalLoot}.`);
	}

	if (payNotes.length > 0) {
		lines.push(payNotes.join('\n'));
	}

	if (xpNotices.length > 0) {
		lines.push(xpNotices.join('\n'));
	}

	return lines.join('\n\n').replace(/:minion:\s+:minion:\s*/gi, ':minion: ');
}
export async function handleCombinedAutoFarm({ user, taskData }: HandleCombinedAutoFarmOptions) {
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

	const messages: string[] = [];
	const attachments: FarmingStepAttachment[] = [];
	const totalLoot = new Bank();
	const summaries: FarmingStepSummary[] = [];
	let handledAny = false;

	for (const step of steps) {
		const stepData: FarmingActivityTaskOptions = {
			...taskData,
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

		const result = await executeFarmingStep({ user, channelID: taskData.channelID, data: stepData });
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
	let message: string | { content: string; files: FarmingStepAttachment[] } = content;
	if (attachments.length > 0) {
		message = {
			content,
			files: attachments
		};
	}

	const loot = totalLoot.length > 0 ? totalLoot : null;

	await handleTripFinish(user, taskData.channelID, message, undefined, taskData, loot);
}
