import { Bank, convertLVLtoXP } from 'oldschooljs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import './setup.js';

import { QuestID } from '@/lib/minions/data/quests.js';
import { calcNumOfPatches, calcVariableYield } from '@/lib/skilling/skills/farming/utils/calcsFarming.js';
import type { Plant } from '@/lib/skilling/types.js';
import { mockMUser } from './userutil.js';

type PlantOverrides = Partial<Plant> & Pick<Plant, 'seedType' | 'name'>;
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type MutableUser = Mutable<ReturnType<typeof mockMUser>['user']>;

function createPlant(overrides: PlantOverrides): Plant {
	return {
		id: 1,
		level: 1,
		plantXp: 0,
		checkXp: 0,
		harvestXp: 0,
		name: overrides.name,
		inputItems: new Bank().freeze(),
		aliases: [],
		needsChopForHarvest: overrides.needsChopForHarvest ?? false,
		fixedOutput: overrides.fixedOutput ?? true,
		givesLogs: overrides.givesLogs ?? false,
		givesCrops: overrides.givesCrops ?? false,
		petChance: 1,
		seedType: overrides.seedType,
		growthTime: 0,
		numOfStages: 0,
		chance1: 0,
		chance99: 0,
		chanceOfDeath: 0,
		defaultNumOfPatches: overrides.defaultNumOfPatches ?? 1,
		canPayFarmer: false,
		canCompostPatch: false,
		canCompostAndPay: false,
		additionalPatchesByQP: overrides.additionalPatchesByQP ?? [],
		additionalPatchesByFarmLvl: overrides.additionalPatchesByFarmLvl ?? [],
		additionalPatchesByFarmGuildAndLvl: overrides.additionalPatchesByFarmGuildAndLvl ?? [],
		timePerPatchTravel: 0,
		timePerHarvest: 0,
		variableYield: overrides.variableYield ?? false,
		variableOutputAmount: overrides.variableOutputAmount,
		outputCrop: overrides.outputCrop,
		cleanHerbCrop: overrides.cleanHerbCrop,
		herbXp: overrides.herbXp,
		herbLvl: overrides.herbLvl,
		outputLogs: overrides.outputLogs,
		outputLogsQuantity: overrides.outputLogsQuantity,
		outputRoots: overrides.outputRoots,
		logDepletionChance: overrides.logDepletionChance,
		treeWoodcuttingLevel: overrides.treeWoodcuttingLevel,
		fixedOutputAmount: overrides.fixedOutputAmount,
		woodcuttingXp: overrides.woodcuttingXp
	} as Plant;
}

function createMockRng() {
	return {
		// only randInt is used by these calcs, but we provide the full-ish surface area
		// so it cleanly satisfies RNGProvider shape.
		rand: vi.fn(),
		randInt: vi.fn(),
		randFloat: vi.fn(),
		roll: vi.fn(),
		shuffle: vi.fn(),
		pick: vi.fn(),
		percentChance: vi.fn(),
		randomVariation: vi.fn()
	};
}

describe('calcsFarming', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('calculates allotment patches without Children of the Sun', () => {
		const plant = createPlant({
			name: 'Allotment plant',
			seedType: 'allotment',
			defaultNumOfPatches: 2,
			additionalPatchesByQP: [[40, 1]],
			additionalPatchesByFarmGuildAndLvl: [[60, 1]],
			additionalPatchesByFarmLvl: [[70, 1]]
		});
		const user = mockMUser({
			skills_farming: convertLVLtoXP(75),
			QP: 60
		});

		const [patches] = calcNumOfPatches(plant, user, 60);
		expect(patches).toBe(3);
	});

	it('restores allotment patches when Children of the Sun is complete', () => {
		const plant = createPlant({
			name: 'Allotment plant',
			seedType: 'allotment',
			defaultNumOfPatches: 2,
			additionalPatchesByQP: [[40, 1]],
			additionalPatchesByFarmGuildAndLvl: [[60, 1]],
			additionalPatchesByFarmLvl: [[70, 1]]
		});
		const user = mockMUser({
			skills_farming: convertLVLtoXP(75),
			QP: 60
		});
		const mutableUser = user.user as MutableUser;
		mutableUser.finished_quest_ids = [QuestID.ChildrenOfTheSun];

		const [patches] = calcNumOfPatches(plant, user, 60);
		expect(patches).toBe(5);
	});

	it('adds an extra herb patch with Children of the Sun', () => {
		const plant = createPlant({
			name: 'Herb plant',
			seedType: 'herb',
			defaultNumOfPatches: 2
		});
		const user = mockMUser({
			skills_farming: convertLVLtoXP(50)
		});
		const mutableUser = user.user as MutableUser;
		mutableUser.finished_quest_ids = [QuestID.ChildrenOfTheSun];

		const [patches] = calcNumOfPatches(plant, user, 0);
		expect(patches).toBe(3);
	});

	it('adds an extra tree patch when the quest is finished', () => {
		const plant = createPlant({
			name: 'Tree plant',
			seedType: 'tree',
			defaultNumOfPatches: 1
		});
		const user = mockMUser({
			skills_farming: convertLVLtoXP(50)
		});
		const mutableUser = user.user as MutableUser;
		mutableUser.finished_quest_ids = [QuestID.ChildrenOfTheSun];

		const [patches] = calcNumOfPatches(plant, user, 0);
		expect(patches).toBe(2);
	});

	it('returns the expected crystal tree variable yield', () => {
		const plant = createPlant({
			name: 'Crystal tree',
			seedType: 'tree',
			variableYield: true,
			variableOutputAmount: [
				['attuned', 2, 4],
				[null, 1, 3]
			]
		});

		const mockRng = createMockRng();
		mockRng.randInt.mockReturnValue(3);

		const result = calcVariableYield(mockRng as any, plant, 'attuned', 90, 2);
		expect(result).toBe(6);
	});

	it('returns the expected yield for Limpwurt plants', () => {
		const plant = createPlant({
			name: 'Limpwurt',
			seedType: 'flower',
			variableYield: true
		});

		const mockRng = createMockRng();
		mockRng.randInt.mockReturnValue(2);

		const result = calcVariableYield(mockRng as any, plant, null, 50, 2);
		expect(result).toBe(10);
	});

	it('returns zero when the plant has no variable yield', () => {
		const plant = createPlant({
			name: 'Static plant',
			seedType: 'herb',
			variableYield: false
		});

		const mockRng = createMockRng();

		const result = calcVariableYield(mockRng as any, plant, null, 50, 2);
		expect(result).toBe(0);
	});
});
