import { plants } from '@/lib/skilling/skills/farming/index.js';
import type { FarmingPatchName } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import { isPatchName } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type {
	FarmingPreferredSeeds,
	FarmingSeedPreference,
	IPatchDataDetailed
} from '@/lib/skilling/skills/farming/utils/types.js';
import type { Plant } from '@/lib/skilling/types.js';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const plantsByPatch = new Map<FarmingPatchName, Plant[]>();
const validPatchNames = new Set<FarmingPatchName>();
for (const plant of plants) {
	const patchName = plant.seedType as FarmingPatchName;
	validPatchNames.add(patchName);
	const list = plantsByPatch.get(patchName) ?? [];
	list.push(plant);
	plantsByPatch.set(patchName, list);
}
for (const list of plantsByPatch.values()) {
	list.sort((a, b) => b.level - a.level);
}

export function getPlantsForPatch(patchName: FarmingPatchName): Plant[] {
	return plantsByPatch.get(patchName) ?? [];
}

export function findPlantBySeedID(seedID: number, patchName: FarmingPatchName): Plant | null {
	for (const plant of getPlantsForPatch(patchName)) {
		if (plant.inputItems.amount(seedID) > 0) {
			return plant;
		}
	}
	return null;
}

function isValidPreferenceRecord(value: unknown): value is { type: string; seedID?: unknown } {
	return isRecord(value) && typeof value.type === 'string';
}

export function normalizeSeedPreference(patchName: FarmingPatchName, value: unknown): FarmingSeedPreference | null {
	if (!isValidPreferenceRecord(value)) {
		return null;
	}

	if (value.type === 'highest_available') {
		return { type: 'highest_available' };
	}
	if (value.type === 'empty') {
		return { type: 'empty' };
	}
	if (value.type === 'seed' && typeof value.seedID === 'number') {
		const plant = findPlantBySeedID(value.seedID, patchName);
		if (!plant) {
			return null;
		}
		return { type: 'seed', seedID: value.seedID };
	}
	return null;
}

export function getPrimarySeedForPlant(plant: Plant): number | null {
	for (const [item] of plant.inputItems.items()) {
		return item.id;
	}
	return null;
}

export function parsePreferredSeeds(raw: unknown): Map<FarmingPatchName, FarmingSeedPreference> {
	const result = new Map<FarmingPatchName, FarmingSeedPreference>();
	if (!isRecord(raw)) {
		return result;
	}

	for (const [key, value] of Object.entries(raw)) {
		if (!isPatchName(key)) {
			continue;
		}
		if (!validPatchNames.has(key)) {
			continue;
		}
		const normalized = normalizeSeedPreference(key, value);
		if (normalized) {
			result.set(key, normalized);
		}
	}

	return result;
}

export function serializePreferredSeeds(
	preferences: Map<FarmingPatchName, FarmingSeedPreference>
): FarmingPreferredSeeds {
	const entries: [FarmingPatchName, FarmingSeedPreference][] = [];
	for (const [patchName, preference] of preferences) {
		if (!validPatchNames.has(patchName)) {
			continue;
		}
		const normalized = normalizeSeedPreference(patchName, preference);
		if (!normalized) {
			continue;
		}
		entries.push([patchName, normalized]);
	}
	return Object.fromEntries(entries);
}

export interface ResolveSeedForPatchOptions {
	patch: IPatchDataDetailed;
	preferContract: boolean;
	contractPlant: Plant | null;
	preferences: Map<FarmingPatchName, FarmingSeedPreference>;
	fallbackPlant: Plant | null;
}

export type ResolvedSeedForPatchResult =
	| { type: 'plant'; plant: Plant; reason: 'contract' | 'preference_seed' | 'fallback' }
	| { type: 'highest'; reason: 'preference_highest' };

export function resolveSeedForPatch({
	patch,
	preferContract,
	contractPlant,
	preferences,
	fallbackPlant
}: ResolveSeedForPatchOptions): ResolvedSeedForPatchResult | null {
	if (patch.ready === false) {
		return null;
	}

	if (preferContract && contractPlant && contractPlant.seedType === patch.patchName) {
		return { type: 'plant', plant: contractPlant, reason: 'contract' };
	}

	const preference = preferences.get(patch.patchName);
	if (preference) {
		if (preference.type === 'empty') {
			return null;
		}
		if (preference.type === 'seed') {
			const plant = findPlantBySeedID(preference.seedID, patch.patchName);
			if (!plant) {
				return null;
			}
			return { type: 'plant', plant, reason: 'preference_seed' };
		}
		if (preference.type === 'highest_available') {
			return { type: 'highest', reason: 'preference_highest' };
		}
	}

	if (fallbackPlant && fallbackPlant.seedType === patch.patchName) {
		return { type: 'plant', plant: fallbackPlant, reason: 'fallback' };
	}

	return null;
}
