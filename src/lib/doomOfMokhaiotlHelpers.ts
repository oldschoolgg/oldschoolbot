import { calcWhatPercent, reduceNumByPercent, round, sumArr, Time } from '@oldschoolgg/toolkit';
import { resolveItems } from 'oldschooljs';
import { clamp } from 'remeda';

import type { AttackStyles } from '@/lib/minions/functions/index.js';
import { XPBank } from '@/lib/structures/XPBank.js';
import type { Skills } from '@/lib/types/index.js';

export const MAX_DELVE = 30;
export const ZCB_SPEED_BOOST = 3;
export const NOXIOUS_HALBERD_SPEED_BOOST = 8;
export const SCORCHING_BOW_SPEED_PENALTY = 17;
export const ELITE_VOID_SPEED_BOOST = 5;
export const MASORI_SPEED_BOOST = 5;
export const MASORI_DEATH_CHANCE_REDUCTION = 2;
export const LIGHTBEARER_SPEED_BOOST = 2;
export const RITE_OF_VILE_TRANSFERENCE_SPEED_BOOST = 3;
const DOOM_BASE_DURATION_MULTIPLIER = 1.13;
export const DOOM_VENOM_PROTECTION_OPTIONS = [
	{
		potionName: 'Anti-venom'
	},
	{
		potionName: 'Anti-venom+'
	},
	{
		potionName: 'Extended anti-venom+'
	}
] as const;
const DOOM_RANGED_XP_PER_HOUR = 105_000;
const DOOM_MAGIC_XP_PER_HOUR = 10_000;
const DOOM_MELEE_XP_PER_HOUR = 5_000;

const DOOM_BASE_DEATH_CHANCES = [5, 10, 15, 20, 25, 30, 50, 75, 77, 79, 81, 82, 83, 85, 87];
const DOOM_LOWEST_MASORI_DEATH_CHANCES = [3, 5, 7, 9, 11, 13, 15, 17];
const DOOM_WAVE_LEARNING_COMPLETIONS = 10;
const DOOM_EARLY_WAVE_DURATION = 1.75 * Time.Minute;
const DOOM_MID_WAVE_DURATION = 2.5 * Time.Minute;
const DOOM_DEEP_WAVE_DURATION = 2.35 * Time.Minute;

const ARROW_TIER_IDS: { mod: number; ids: number[] }[] = [
	{ mod: -0.08, ids: resolveItems(['Dragon arrow']) },
	{ mod: -0.04, ids: resolveItems(['Amethyst arrow']) },
	{ mod: 0.05, ids: resolveItems(['Rune arrow']) },
	{ mod: 0.12, ids: resolveItems(['Adamant arrow']) },
	{ mod: 0.12, ids: resolveItems(['Mithril arrow']) },
	{ mod: 0.12, ids: resolveItems(['Steel arrow']) },
	{ mod: 0.12, ids: resolveItems(['Iron arrow']) },
	{ mod: 0.12, ids: resolveItems(['Bronze arrow']) }
];

export type DoomWaveCompletions = Record<number, number>;
export type DoomMeleePunishWeapon = 'noxious_halberd' | 'crystal_halberd' | 'dual_macuahuitl';
export type DoomVenomProtectionOption = (typeof DOOM_VENOM_PROTECTION_OPTIONS)[number];

export interface DoomVenomProtection {
	option: DoomVenomProtectionOption;
	itemName: string;
	consumedDoseItemName: string;
	replacementItemName: string | null;
}

export function normaliseDoomWaveCompletions(rawCompletions: unknown): DoomWaveCompletions {
	if (!rawCompletions || typeof rawCompletions !== 'object') return {};
	const completions: DoomWaveCompletions = {};
	for (const [rawWave, rawCount] of Object.entries(rawCompletions)) {
		const wave = Number(rawWave);
		const count = Number(rawCount);
		if (!Number.isInteger(wave) || wave < 1 || wave > MAX_DELVE) continue;
		if (!Number.isInteger(count) || count < 1) continue;
		completions[wave] = count;
	}
	return completions;
}

function getDoomBaseDeathChance(delve: number): number {
	return DOOM_BASE_DEATH_CHANCES[delve - 1] ?? Math.min(95, 87 + (delve - DOOM_BASE_DEATH_CHANCES.length) * 2);
}

function getDoomLowestDeathChanceBeforeGear(delve: number): number {
	return (DOOM_LOWEST_MASORI_DEATH_CHANCES[delve - 8] ?? 20) + MASORI_DEATH_CHANCE_REDUCTION;
}

function getDoomWaveLearningProgress(delve: number, waveCompletions: DoomWaveCompletions): number {
	return clamp((waveCompletions[delve] ?? 0) / DOOM_WAVE_LEARNING_COMPLETIONS, { min: 0, max: 1 });
}

function isDoomWaveLearned(delve: number, waveCompletions: DoomWaveCompletions): boolean {
	return delve <= 7 && (waveCompletions[delve] ?? 0) >= delve;
}

export function calculateDeathChance(
	delve: number,
	_deepDelves: number,
	_totalDelves: number,
	hasMasori: boolean,
	waveCompletions: DoomWaveCompletions = {}
): number {
	if (isDoomWaveLearned(delve, waveCompletions)) return 0;

	const base = getDoomBaseDeathChance(delve);
	let chance = base;

	if (delve >= 8) {
		const minimumChance = getDoomLowestDeathChanceBeforeGear(delve);
		const learningProgress = getDoomWaveLearningProgress(delve, waveCompletions);
		const learnableChance = base - minimumChance;
		chance = Math.max(minimumChance, base - learnableChance * learningProgress);
	}

	if (hasMasori) chance -= MASORI_DEATH_CHANCE_REDUCTION;

	return clamp(chance, { min: 0.1, max: 95 });
}

export function calculateDoomDeathChances(
	targetDelve: number,
	deepDelves: number,
	totalDelves: number,
	hasMasori: boolean,
	waveCompletions: DoomWaveCompletions = {}
): number[] {
	return Array.from({ length: targetDelve }, (_, index) =>
		calculateDeathChance(index + 1, deepDelves, totalDelves, hasMasori, waveCompletions)
	);
}

export function calculateDoomRunDeathChance(deathChances: number[]): {
	deathChance: number;
	expectedDeathWave: number | null;
} {
	let survivalChance = 1;
	let deathChance = 0;
	let expectedDeathWave = 0;

	for (const [index, waveDeathChance] of deathChances.entries()) {
		const chanceToDieHere = survivalChance * (waveDeathChance / 100);
		deathChance += chanceToDieHere;
		expectedDeathWave += (index + 1) * chanceToDieHere;
		survivalChance *= 1 - waveDeathChance / 100;
	}

	return {
		deathChance: deathChance * 100,
		expectedDeathWave: deathChance > 0 ? expectedDeathWave / deathChance : null
	};
}

export function calculateDoomWipeChanceBeforeTarget(deathChances: number[]): number {
	if (deathChances.length <= 1) return 0;
	return calculateDoomRunDeathChance(deathChances.slice(0, -1)).deathChance;
}

export function formatDoomDeathChance(chance: number): string {
	if (chance >= 99.995) return '100%';
	if (chance > 0 && chance < 0.01) return '<0.01%';
	return `${round(chance, 2)}%`;
}

export function calculateDoomZcbBoltsNeeded(targetDelve: number, avasReduction = 0): number {
	const rawBoltsNeeded = targetDelve <= 9 ? 6 : 6 + (targetDelve - 9);
	const baseBoltsNeeded = Math.ceil(rawBoltsNeeded / 2);
	return Math.max(1, Math.ceil(baseBoltsNeeded * (1 - avasReduction / 100)));
}

export function selectDoomVenomProtection(itemQuantity: (itemName: string) => number): DoomVenomProtection | null {
	for (const option of DOOM_VENOM_PROTECTION_OPTIONS) {
		for (const dose of [1, 2, 3, 4]) {
			const itemName = `${option.potionName}(${dose})`;
			if (itemQuantity(itemName) <= 0) continue;
			return {
				option,
				itemName,
				consumedDoseItemName: `${option.potionName}(1)`,
				replacementItemName: dose > 1 ? `${option.potionName}(${dose - 1})` : null
			};
		}
	}
	return null;
}

function getDoomDurationVariance(rng: RNGProvider): number {
	const roll = rng.randFloat(0, 1);
	if (roll < 0.05) return 0.8 + (roll / 0.05) * 0.02;
	return 0.95 + ((roll - 0.05) / 0.95) * 0.1;
}

export function getDoomArrowMod(arrowId: number | null): number {
	if (arrowId === null) return 0.12;
	return ARROW_TIER_IDS.find(tier => tier.ids.includes(arrowId))?.mod ?? 0.12;
}

export function selectDoomMeleePunishWeapon(options: {
	hasNoxHalberd: boolean;
	hasCrystalHalberd: boolean;
	hasDualMacuahuitl: boolean;
	crystalShardsOwned: number;
	crystalShardsNeeded: number;
}): DoomMeleePunishWeapon | null {
	if (options.hasNoxHalberd) return 'noxious_halberd';
	if (options.hasCrystalHalberd && options.crystalShardsOwned >= options.crystalShardsNeeded) {
		return 'crystal_halberd';
	}
	if (options.hasDualMacuahuitl) return 'dual_macuahuitl';
	if (options.hasCrystalHalberd) return 'crystal_halberd';
	return null;
}

export function getDoomMeleePunishWeaponName(weapon: DoomMeleePunishWeapon): string {
	switch (weapon) {
		case 'noxious_halberd':
			return 'Noxious halberd';
		case 'crystal_halberd':
			return 'Crystal halberd';
		case 'dual_macuahuitl':
			return 'Dual macuahuitl';
	}
}

export function calculateDoomTripDuration(
	targetDelve: number,
	hasTbow: boolean,
	hasSBow: boolean,
	hasZcb: boolean,
	hasLightbearer: boolean,
	meleePunishWeapon: DoomMeleePunishWeapon | null,
	hasMasori: boolean,
	hasEliteVoid: boolean,
	hasRiteOfVileTransference: boolean,
	arrowMod: number,
	rng: RNGProvider
): number {
	let totalBase = 0;
	for (let d = 1; d <= targetDelve; d++) {
		if (d <= 5) totalBase += DOOM_EARLY_WAVE_DURATION;
		else if (d <= 8) totalBase += DOOM_MID_WAVE_DURATION;
		else totalBase += DOOM_DEEP_WAVE_DURATION;
	}

	let weaponMod = 1.0;
	if (hasTbow) weaponMod -= 0.1;
	else if (hasSBow) weaponMod += SCORCHING_BOW_SPEED_PENALTY / 100;
	if (hasZcb) weaponMod -= ZCB_SPEED_BOOST / 100;
	if (hasLightbearer) weaponMod -= LIGHTBEARER_SPEED_BOOST / 100;
	if (meleePunishWeapon === 'noxious_halberd') weaponMod -= NOXIOUS_HALBERD_SPEED_BOOST / 100;
	if (hasMasori) weaponMod -= MASORI_SPEED_BOOST / 100;
	if (hasEliteVoid) weaponMod -= ELITE_VOID_SPEED_BOOST / 100;
	if (hasRiteOfVileTransference) weaponMod -= RITE_OF_VILE_TRANSFERENCE_SPEED_BOOST / 100;
	weaponMod += arrowMod;

	return totalBase * DOOM_BASE_DURATION_MULTIPLIER * weaponMod * getDoomDurationVariance(rng);
}

export function calculateDoomKcReduction(kc: number, baseDuration: number): number {
	const kcForOnePercent = (Time.Hour * 5) / baseDuration;
	return Math.min(Math.floor(Math.max(1, kc) / kcForOnePercent), 10);
}

export function applyDoomSkillBoost(skillsAsLevels: Required<Skills>, duration: number): [number, string] {
	const styles: AttackStyles[] = ['attack', 'strength', 'magic', 'ranged'];
	const skillTotal = sumArr(styles.map(s => skillsAsLevels[s]));
	let percent = round(calcWhatPercent(skillTotal, styles.length * 99), 2);

	if (percent < 50) {
		percent = 50 - percent;
		return [duration + (duration * percent) / 100, `${percent.toFixed(2)}% slower for low stats`];
	}

	percent = Math.min(15, percent / 6.5);
	return [reduceNumByPercent(duration, percent), `${percent.toFixed(2)}% for stats`];
}

export function calculateDoomXP({
	duration,
	targetDelve,
	totalWavesCleared,
	minimal = true
}: {
	duration: number;
	targetDelve: number;
	totalWavesCleared: number;
	minimal?: boolean;
}) {
	const completionRatio = clamp(totalWavesCleared / targetDelve, { min: 0, max: 1 });
	const hours = duration / Time.Hour;
	const xpMultiplier = hours * completionRatio;
	const hitpointsXPPerHour = (DOOM_RANGED_XP_PER_HOUR + DOOM_MAGIC_XP_PER_HOUR + DOOM_MELEE_XP_PER_HOUR) / 3;
	const debugId = `doom_xp duration[${duration}] target[${targetDelve}] cleared[${totalWavesCleared}]`;

	return new XPBank()
		.add('ranged', Math.floor(DOOM_RANGED_XP_PER_HOUR * xpMultiplier), {
			duration,
			minimal,
			debugId
		})
		.add('magic', Math.floor(DOOM_MAGIC_XP_PER_HOUR * xpMultiplier), {
			duration,
			minimal,
			debugId
		})
		.add('attack', Math.floor((DOOM_MELEE_XP_PER_HOUR / 2) * xpMultiplier), {
			duration,
			minimal,
			debugId
		})
		.add('strength', Math.floor((DOOM_MELEE_XP_PER_HOUR / 2) * xpMultiplier), {
			duration,
			minimal,
			debugId
		})
		.add('hitpoints', Math.floor(hitpointsXPPerHour * xpMultiplier), {
			duration,
			minimal,
			debugId
		});
}
