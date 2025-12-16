import { percentChance } from '@oldschoolgg/rng';
import { isObject, stringMatches } from '@oldschoolgg/toolkit';

import type { Prisma, User } from '@/prisma/main.js';
import { allSlayerTasks } from '@/lib/slayer/tasks/index.js';

export type SlayerJewellerySetting = 'slaughter' | 'expeditious' | 'off';

export type SlayerJewelleryConfig = Record<string, SlayerJewellerySetting>;

export interface SlayerBraceletCharges {
	slaughter: number;
	expeditious: number;
}

export interface SlayerBraceletResult {
	braceletChoice: SlayerJewellerySetting;
	procs: SlayerBraceletCharges;
	chargesRemaining: SlayerBraceletCharges;
	quantitySlayed: number;
	effectiveSlayed: number;
	quantityLeft: number;
}

export const SlayerJewellerySettings: readonly SlayerJewellerySetting[] = ['slaughter', 'expeditious', 'off'] as const;

function normaliseTaskKey(taskName: string) {
	return taskName.trim().toLowerCase();
}

export const normalizeSlayerTaskKey = normaliseTaskKey;

function isValidSetting(setting: unknown): setting is SlayerJewellerySetting {
	return typeof setting === 'string' && SlayerJewellerySettings.includes(setting as SlayerJewellerySetting);
}

export function parseSlayerJewelleryConfig(config: Prisma.JsonValue | null | undefined): SlayerJewelleryConfig {
	if (!config || !isObject(config) || Array.isArray(config)) {
		return {};
	}
	const parsed: SlayerJewelleryConfig = {};
	for (const [key, value] of Object.entries(config)) {
		if (!isValidSetting(value)) continue;
		parsed[normaliseTaskKey(key)] = value;
	}
	return parsed;
}

export function resolveSlayerJewelleryChoice(
	taskName: string | null,
	config: SlayerJewelleryConfig
): SlayerJewellerySetting {
	const taskKey = taskName ? normaliseTaskKey(taskName) : null;
	if (taskKey && isValidSetting(config[taskKey])) return config[taskKey];
	if (isValidSetting(config.all)) return config.all;
	return 'off';
}

export function matchSlayerTaskName(input: string): string | null {
	const cleaned = input.trim();
	if (!cleaned) return null;
	if (cleaned.toLowerCase() === 'all') return 'all';
	const matched = allSlayerTasks.find(task => stringMatches(task.monster.name, cleaned));
	return matched?.monster.name ?? null;
}

export function slayerTaskNameList() {
	return Array.from(new Set(allSlayerTasks.map(task => task.monster.name)));
}

export function getSlayerBraceletChargesFromUser(
	user: Pick<User, 'slayer_slaughter_charges' | 'slayer_expeditious_charges'>
): SlayerBraceletCharges {
	return {
		slaughter: user.slayer_slaughter_charges ?? 0,
		expeditious: user.slayer_expeditious_charges ?? 0
	};
}

export function simulateSlayerBraceletEffects({
	quantityKilled,
	quantityRemaining,
	braceletCharges,
	braceletChoice,
	baseKillCredit,
	rollChance = percentChance
}: {
	quantityKilled: number;
	quantityRemaining: number;
	braceletCharges: SlayerBraceletCharges;
	braceletChoice: SlayerJewellerySetting;
	baseKillCredit: () => number;
	rollChance?: (percent: number) => boolean;
}): SlayerBraceletResult {
	let remaining = quantityRemaining;
	let quantitySlayed = 0;
	let effectiveSlayed = 0;
	const procs: SlayerBraceletCharges = { slaughter: 0, expeditious: 0 };
	const chargesRemaining: SlayerBraceletCharges = { ...braceletCharges };

	for (let i = 0; i < quantityKilled; i++) {
		if (remaining <= 0) break;

		quantitySlayed++;
		const baseCredit = Math.max(1, Math.floor(baseKillCredit()));
		const cappedBaseCredit = Math.min(remaining, baseCredit);
		let credit = cappedBaseCredit;

		if (braceletChoice === 'slaughter' && chargesRemaining.slaughter > 0 && rollChance(25)) {
			procs.slaughter++;
			chargesRemaining.slaughter--;
			credit = 0;
		} else if (braceletChoice === 'expeditious' && chargesRemaining.expeditious > 0 && rollChance(25)) {
			procs.expeditious++;
			chargesRemaining.expeditious--;
			credit = Math.min(remaining, cappedBaseCredit * 2);
		}

		effectiveSlayed += credit;
		remaining = Math.max(0, remaining - credit);
	}

	return {
		braceletChoice,
		procs,
		chargesRemaining,
		quantitySlayed,
		effectiveSlayed,
		quantityLeft: remaining
	};
}
