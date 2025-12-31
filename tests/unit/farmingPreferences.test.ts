import { describe, expect, it } from 'vitest';

import './setup.js';

import {
	getPlantsForPatch,
	parsePreferredSeeds,
	resolveSeedForPatch
} from '@/lib/skilling/skills/farming/autoFarm/preferences.js';
import { plants } from '@/lib/skilling/skills/farming/index.js';
import type {
	FarmingPatchName,
	FarmingSeedPreference,
	IPatchDataDetailed
} from '@/lib/skilling/skills/farming/utils/types.js';

const herbPlant = plants.find(plant => plant.name === 'Guam');
const treePlant = plants.find(plant => plant.name === 'Oak tree');
const cactusPlant = plants.find(plant => plant.name === 'Cactus');

if (!herbPlant || !treePlant || !cactusPlant) {
	throw new Error('Expected Guam, Oak tree, and Cactus plants to exist for farming preference tests');
}

const [herbSeedItem] = herbPlant.inputItems.items();
const herbSeedID = herbSeedItem?.[0].id;

if (!herbSeedID) {
	throw new Error('Expected Guam plant to have a primary seed item');
}

const basePatchData: IPatchDataDetailed = {
	lastPlanted: null,
	patchPlanted: false,
	plantTime: Date.now(),
	lastQuantity: 0,
	lastUpgradeType: null,
	lastPayment: false,
	ready: true,
	readyIn: 0,
	readyAt: new Date(),
	patchName: herbPlant.seedType as FarmingPatchName,
	friendlyName: 'Herb patch',
	plant: null
};

describe('farming seed preferences', () => {
	it('parsePreferredSeeds returns empty map for undefined input', () => {
		const result = parsePreferredSeeds(undefined);
		expect(result.size).toBe(0);
	});

	it('parsePreferredSeeds normalizes valid preferences and ignores invalid patch names', () => {
		const raw = {
			[herbPlant.seedType]: { type: 'seed', seedID: herbSeedID },
			[treePlant.seedType]: { type: 'highest_available' },
			[cactusPlant.seedType]: { type: 'empty' },
			invalid_patch: { type: 'seed', seedID: 12345 },
			[herbPlant.seedType + '_wrong']: { type: 'seed', seedID: herbSeedID }
		} as const;

		const result = parsePreferredSeeds(raw);

		expect(result.get(herbPlant.seedType as FarmingPatchName)).toEqual({
			type: 'seed',
			seedID: herbSeedID
		});
		expect(result.get(treePlant.seedType as FarmingPatchName)).toEqual({
			type: 'highest_available'
		});
		expect(result.get(cactusPlant.seedType as FarmingPatchName)).toEqual({
			type: 'empty'
		});
		expect(result.size).toBe(3);
	});

	it('parsePreferredSeeds skips entries with unknown seed IDs', () => {
		const raw = {
			[treePlant.seedType]: { type: 'seed', seedID: 99999 }
		} as const;

		const result = parsePreferredSeeds(raw);

		expect(result.size).toBe(0);
	});

	it('getPlantsForPatch returns sorted plant list and handles empty patches', () => {
		const herbPlants = getPlantsForPatch(herbPlant.seedType as FarmingPatchName);
		expect(herbPlants.length).toBeGreaterThan(0);
		for (let i = 1; i < herbPlants.length; i++) {
			expect(herbPlants[i - 1].level).toBeGreaterThanOrEqual(herbPlants[i].level);
		}

		const noPlants = getPlantsForPatch('unknown_patch' as FarmingPatchName);
		expect(noPlants).toEqual([]);
	});

	it('resolveSeedForPatch prioritizes contract plants when preferred', () => {
		const result = resolveSeedForPatch({
			patch: basePatchData,
			preferContract: true,
			contractPlant: herbPlant,
			preferences: new Map(),
			fallbackPlant: null
		});

		expect(result).toEqual({ type: 'plant', plant: herbPlant, reason: 'contract' });
	});

	it('resolveSeedForPatch uses seed preference when available', () => {
		const preferences = new Map<FarmingPatchName, FarmingSeedPreference>();
		preferences.set(herbPlant.seedType as FarmingPatchName, { type: 'seed', seedID: herbSeedID });

		const result = resolveSeedForPatch({
			patch: basePatchData,
			preferContract: false,
			contractPlant: null,
			preferences,
			fallbackPlant: null
		});

		expect(result).toEqual({
			type: 'plant',
			plant: herbPlant,
			reason: 'preference_seed'
		});
	});

	it('resolveSeedForPatch returns highest option when preference is highest_available', () => {
		const preferences = new Map<FarmingPatchName, FarmingSeedPreference>();
		preferences.set(herbPlant.seedType as FarmingPatchName, { type: 'highest_available' });

		const result = resolveSeedForPatch({
			patch: basePatchData,
			preferContract: false,
			contractPlant: null,
			preferences,
			fallbackPlant: null
		});

		expect(result).toEqual({ type: 'highest', reason: 'preference_highest' });
	});

	it('resolveSeedForPatch falls back to provided plant when no preferences apply', () => {
		const treePatch: IPatchDataDetailed = {
			...basePatchData,
			patchName: treePlant.seedType as FarmingPatchName,
			friendlyName: 'Tree patch'
		};

		const result = resolveSeedForPatch({
			patch: treePatch,
			preferContract: false,
			contractPlant: null,
			preferences: new Map(),
			fallbackPlant: treePlant
		});

		expect(result).toEqual({ type: 'plant', plant: treePlant, reason: 'fallback' });
	});

	it('resolveSeedForPatch returns null when no rule applies or patch is not ready', () => {
		const notReadyPatch: IPatchDataDetailed = {
			...basePatchData,
			ready: false
		};

		const noPreferenceResult = resolveSeedForPatch({
			patch: { ...basePatchData, patchName: cactusPlant.seedType as FarmingPatchName },
			preferContract: false,
			contractPlant: null,
			preferences: new Map(),
			fallbackPlant: null
		});

		const notReadyResult = resolveSeedForPatch({
			patch: notReadyPatch,
			preferContract: true,
			contractPlant: herbPlant,
			preferences: new Map(),
			fallbackPlant: treePlant
		});

		expect(noPreferenceResult).toBeNull();
		expect(notReadyResult).toBeNull();
	});

	it('resolveSeedForPatch ignores invalid seed preferences', () => {
		const preferences = new Map<FarmingPatchName, FarmingSeedPreference>();
		preferences.set(herbPlant.seedType as FarmingPatchName, { type: 'seed', seedID: 999999 });

		const result = resolveSeedForPatch({
			patch: basePatchData,
			preferContract: false,
			contractPlant: null,
			preferences,
			fallbackPlant: null
		});

		expect(result).toBeNull();
	});

	it('resolveSeedForPatch respects empty preference type', () => {
		const preferences = new Map<FarmingPatchName, FarmingSeedPreference>();
		preferences.set(herbPlant.seedType as FarmingPatchName, { type: 'empty' });

		const result = resolveSeedForPatch({
			patch: basePatchData,
			preferContract: false,
			contractPlant: herbPlant,
			preferences,
			fallbackPlant: treePlant
		});

		expect(result).toBeNull();
	});
});
