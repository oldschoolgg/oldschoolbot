import { type MaterialType, materialTypes } from '@/lib/bso/skills/invention/index.js';
import { MaterialBank } from '@/lib/bso/skills/invention/MaterialBank.js';

import { toTitleCase } from '@oldschoolgg/toolkit';
import { Bank, toKMB } from 'oldschooljs';

import { formatFarmingBoosts } from '@/lib/skilling/skills/farming/utils/farmingFormatters.js';
import type { AutoFarmStepData, AutoFarmSummary, FarmingActivityTaskOptions } from '@/lib/types/minions.js';
import { handleTripFinish as defaultHandleTripFinish } from '@/lib/util/handleTripFinish.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { executeFarmingStep, type FarmingStepResult, type FarmingStepSummary } from './farmingStep.js';

function getPatchLabel(data: FarmingActivityTaskOptions): string {
	const patchType = data.patchType as Partial<typeof data.patchType> & { friendlyName?: string; patchName?: string };
	return data.patchName ?? patchType.friendlyName ?? patchType.patchName ?? 'patches';
}

function getMaterialTypeFromDisplayName(displayName: string): MaterialType | null {
	const normalisedName = displayName.toLowerCase();
	return materialTypes.find(type => type === normalisedName || toTitleCase(type) === displayName) ?? null;
}

function parseMaterialCostSegment(segment: string): { material: MaterialType; quantity: number } | null {
	const match = segment.match(/^([\d,]+)x (.+)$/);
	if (!match) return null;

	const quantity = Number.parseInt(match[1].replace(/,/g, ''), 10);
	const material = getMaterialTypeFromDisplayName(match[2]);
	if (!material || Number.isNaN(quantity)) return null;

	return { material, quantity };
}

function parseArcaneHarvesterBoost(
	boost: string
): { percent: string; materialCost: MaterialBank; notes: string[] } | null {
	const match = boost.match(/^(\d+)% bonus yield from Arcane Harvester \((.+)\)$/);
	if (!match) return null;

	const messageParts = match[2].split(', ');
	const firstPart = messageParts.shift();
	if (!firstPart?.startsWith('Removed ')) return null;

	const firstCost = parseMaterialCostSegment(firstPart.replace('Removed ', ''));
	if (!firstCost) return null;

	const materialCost = new MaterialBank();
	const notes: string[] = [];
	materialCost.add(firstCost.material, firstCost.quantity);

	for (const part of messageParts) {
		const cost = parseMaterialCostSegment(part);
		if (cost) {
			materialCost.add(cost.material, cost.quantity);
		} else {
			notes.push(part);
		}
	}

	return { percent: match[1], materialCost, notes };
}

function formatAutoFarmBoosts(summary: AutoFarmSummary): string {
	const boostSources = summary.boostSources ?? summary.boosts.map(boost => ({ boost }));
	const arcaneHarvester = {
		percent: '',
		materialCost: new MaterialBank(),
		notes: new Set<string>()
	};
	const boosts: string[] = [];

	for (const { boost } of boostSources) {
		const arcaneBoost = parseArcaneHarvesterBoost(boost);
		if (!arcaneBoost) {
			boosts.push(boost);
			continue;
		}

		arcaneHarvester.percent = arcaneBoost.percent;
		arcaneHarvester.materialCost.add(arcaneBoost.materialCost);
		for (const note of arcaneBoost.notes) {
			arcaneHarvester.notes.add(note);
		}
	}

	if (arcaneHarvester.percent && arcaneHarvester.materialCost.values().length > 0) {
		const notes = [...arcaneHarvester.notes];
		const noteStr = notes.length > 0 ? `, ${notes.join(', ')}` : '';
		boosts.push(
			`${arcaneHarvester.percent}% bonus yield from Arcane Harvester (Removed ${arcaneHarvester.materialCost}${noteStr})`
		);
	}

	return formatFarmingBoosts(boosts, { prefix: '', label: '**Boosts:**' });
}

function extractXPBoostMessages(message: string | undefined): string[] {
	if (!message) return [];
	return message.match(/You received (?:\d+(?:\.\d+)?% bonus XP|bonus XP from)[^.]*\./g) ?? [];
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
		boostSources: [],
		xpBoostMessages: [],
		attachmentMessages: [],
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
	const stepBoostSources = (stepSummary?.boosts ?? []).map(boost => ({
		boost
	}));

	const lootBank = new Bank(baseSummary.totalLoot ?? {});
	if (loot) {
		lootBank.add(loot);
	}

	const stepQuantity =
		stepSummary?.planted?.quantity ?? stepSummary?.harvested?.quantity ?? data.quantity ?? baseSummary.steps.length;
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
		boostSources: [...(baseSummary.boostSources ?? []), ...stepBoostSources],
		xpBoostMessages: [
			...(baseSummary.xpBoostMessages ?? []),
			...extractXPBoostMessages(stepSummary?.xpMessages.farming)
		],
		attachmentMessages: [
			...(baseSummary.attachmentMessages ?? []),
			...(stepSummary?.attachmentMessage ? [stepSummary.attachmentMessage] : [])
		],
		steps: [
			...baseSummary.steps,
			{
				patchType: getPatchLabel(data),
				plantsName,
				quantity: stepQuantity,
				harvestedName: stepSummary?.harvested?.itemName,
				harvestedQuantity: stepSummary?.harvested?.quantity,
				alive: stepSummary?.harvested?.alive,
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
	const calcXPPerHour = (xp: number, duration: number): number => {
		if (duration <= 0) return 0;
		let rawXPHr = (xp / (duration / 60_000)) * 60;
		rawXPHr = Math.floor(rawXPHr / 1000) * 1000;
		return Math.floor(rawXPHr);
	};
	const formatXPWithRate = (skillName: string, xp: number, duration: number): string => {
		return `${skillName} ${xp.toLocaleString()} XP (${toKMB(calcXPPerHour(xp, duration))}/Hr)`;
	};

	const lines: string[] = [`${user}, ${user.minionName} finished auto farming your patches.`];

	const xpParts: string[] = [];
	if (summary.totalXP > 0) {
		const bonusSegment = summary.totalBonusXP > 0 ? `, +${summary.totalBonusXP.toLocaleString()} bonus` : '';
		xpParts.push(
			`Farming ${summary.totalXP.toLocaleString()} XP (${toKMB(calcXPPerHour(summary.totalXP, summary.totalDuration))}/Hr${bonusSegment})`
		);
	}
	if (summary.totalWoodcuttingXP > 0) {
		xpParts.push(formatXPWithRate('Woodcutting', summary.totalWoodcuttingXP, summary.totalDuration));
	}
	if (summary.totalHerbloreXP > 0) {
		xpParts.push(formatXPWithRate('Herblore', summary.totalHerbloreXP, summary.totalDuration));
	}
	if (xpParts.length > 0) {
		lines.push(`**XP gained:** ${xpParts.join(', ')}.`);
	}
	if (summary.totalBonusXP > 0) {
		lines.push(
			`You received an additional ${summary.totalBonusXP.toLocaleString()} bonus XP from your farmer's outfit.`
		);
	}
	const xpBoostMessages = [...new Set(summary.xpBoostMessages ?? [])];
	if (xpBoostMessages.length > 0) {
		lines.push(...xpBoostMessages);
	}

	if (summary.contractsCompleted > 0) {
		const suffix = summary.contractsCompleted === 1 ? '' : 's';
		lines.push(`Completed ${summary.contractsCompleted.toLocaleString()} farming contract${suffix}.`);
	}

	const survivalLines = summary.steps.flatMap(step => {
		if (!step.harvestedName || step.harvestedQuantity === undefined || step.alive === undefined) {
			return [];
		}
		if (step.alive >= step.harvestedQuantity) {
			return [];
		}
		return `${step.harvestedName}: ${(step.harvestedQuantity - step.alive).toLocaleString()} died`;
	});
	if (survivalLines.length > 0) {
		lines.push(`**Crop deaths:** ${survivalLines.join('; ')}.`);
	}

	const totalLoot = new Bank(summary.totalLoot ?? {});
	if (summary.totalWeeds > 0 && totalLoot.amount('Weeds') === 0) {
		totalLoot.add('Weeds', summary.totalWeeds);
	}

	const boostLine = formatAutoFarmBoosts(summary);
	if (boostLine) lines.push(boostLine);

	return lines.join('\n');
}

function taskToAutoFarmStep(data: FarmingActivityTaskOptions): AutoFarmStepData {
	return {
		plantsName: data.plantsName,
		quantity: data.quantity,
		upgradeType: data.upgradeType,
		patchName: data.patchName,
		payment: data.payment,
		treeChopFeePaid: data.treeChopFeePaid,
		treeChopFeePlanned: data.treeChopFeePlanned,
		patchType: data.patchType,
		planting: data.planting,
		currentDate: data.currentDate,
		duration: data.duration,
		pid: data.pid
	};
}

function planIncludesCurrentTask(data: FarmingActivityTaskOptions, plan: AutoFarmStepData[]): boolean {
	const firstStep = plan[0];
	const patchNameMatches = !firstStep?.patchName || !data.patchName || firstStep.patchName === data.patchName;
	return Boolean(
		firstStep &&
			firstStep.plantsName === data.plantsName &&
			firstStep.currentDate === data.currentDate &&
			patchNameMatches
	);
}

function makeStepTaskData(
	data: FarmingActivityTaskOptions,
	channelId: string,
	step: AutoFarmStepData
): FarmingActivityTaskOptions {
	return {
		...data,
		channelId,
		plantsName: step.plantsName,
		patchType: step.patchType,
		quantity: step.quantity,
		upgradeType: step.upgradeType,
		payment: step.payment,
		treeChopFeePaid: step.treeChopFeePaid,
		treeChopFeePlanned: step.treeChopFeePlanned,
		planting: step.planting,
		duration: step.duration,
		currentDate: step.currentDate,
		autoFarmed: true,
		autoFarmPlan: [],
		autoFarmCombined: false,
		autoFarmSummary: undefined,
		patchName: step.patchName,
		pid: step.pid
	};
}

export const farmingTask: MinionTask = {
	type: 'Farming',
	async run(data: FarmingActivityTaskOptions, options) {
		const user = options?.user ?? (await mUserFetch(data.userID));
		const handleTripFinish = options?.handleTripFinish ?? defaultHandleTripFinish;
		const rng = options?.rng;
		const legacyChannelId = (data as { channelID?: string }).channelID;
		const channelId = data.channelId ?? legacyChannelId;
		if (!channelId) {
			throw new Error('Farming task completed without a channel id.');
		}

		const combinedMode = Boolean(data.autoFarmCombined);
		let result: FarmingStepResult | null = null;
		let updatedSummary = data.autoFarmSummary;

		if (combinedMode) {
			const storedPlan = data.autoFarmPlan ?? [];
			const steps = planIncludesCurrentTask(data, storedPlan)
				? storedPlan
				: [taskToAutoFarmStep(data), ...storedPlan];
			for (const step of steps) {
				const stepData = makeStepTaskData(data, channelId, step);
				result = await executeFarmingStep({ user, channelID: channelId, data: stepData, rng });
				if (!result) {
					await handleTripFinish({
						user,
						channelId,
						message: `${user}, ${user.minionName} finished farming, but could not complete all follow-up actions.`,
						data,
						loot: null
					});
					return;
				}
				if (result.stopChain) {
					break;
				}
				updatedSummary = updateAutoFarmSummary({
					existingSummary: updatedSummary,
					data: stepData,
					loot: result.loot ?? null,
					stepSummary: result.summary
				});
			}
		} else {
			result = await executeFarmingStep({ user, channelID: channelId, data, rng });
			if (!result) {
				await handleTripFinish({
					user,
					channelId,
					message: `${user}, ${user.minionName} finished farming, but could not complete all follow-up actions.`,
					data,
					loot: null
				});
				return;
			}
		}
		if (!result) {
			await handleTripFinish({
				user,
				channelId,
				message: `${user}, ${user.minionName} finished farming, but could not complete all follow-up actions.`,
				data,
				loot: null
			});
			return;
		}

		const shouldRenderCombinedSummary = Boolean(combinedMode && updatedSummary && !result.stopChain);
		const totalLoot = shouldRenderCombinedSummary ? new Bank(updatedSummary!.totalLoot ?? {}) : result.loot;
		const content = shouldRenderCombinedSummary
			? buildCombinedAutoFarmMessage(user, updatedSummary!)
			: result.message;
		const finalContent =
			shouldRenderCombinedSummary && updatedSummary!.attachmentMessages.length > 0
				? `${content}\n\n${updatedSummary!.attachmentMessages.join('\n\n')}`
				: content;
		const files: SendableFile[] = [];
		if (result.attachment) {
			files.push(result.attachment);
		}
		if (shouldRenderCombinedSummary && totalLoot && totalLoot.length > 0) {
			files.push(await makeBankImage({ bank: totalLoot, title: 'Loot From Auto Farming', user }));
		}
		const message = files.length > 0 ? { content: finalContent, files } : finalContent;
		const tripFinishData = shouldRenderCombinedSummary
			? ({ ...data, duration: updatedSummary!.totalDuration } satisfies FarmingActivityTaskOptions)
			: data;

		await handleTripFinish({
			user,
			channelId,
			message,
			data: tripFinishData,
			loot: totalLoot && totalLoot.length > 0 ? totalLoot : null
		});
	}
};
