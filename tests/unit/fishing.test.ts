import { Time } from '@oldschoolgg/toolkit';
import { type RNGProvider, SeedableRNG } from 'node-rng';
import { Bank, EItem, toKMB } from 'oldschooljs';
import { afterEach, describe, expect, test, vi } from 'vitest';

import * as addSkillingClueToLootModule from '../../src/lib/minions/functions/addSkillingClueToLoot.js';
import { Fishing } from '../../src/lib/skilling/skills/fishing/fishing.js';
import { calcFishingTripStart } from '../../src/lib/skilling/skills/fishing/fishingTripStart.js';
import {
	calcAnglerBonusXP,
	calcAnglerBoostPercent,
	calcLeapingExpectedBait,
	calcLeapingExpectedCookingXP,
	calcMinnowQuantityRange,
	calcRadasBlessingBoost
} from '../../src/lib/skilling/skills/fishing/fishingUtil.js';
import * as utilModule from '../../src/lib/util.js';
import { makeGearBank } from './utils.js';

interface SimpleRNG {
	roll(max: number): boolean;
	randInt(min: number, max: number): number;
	randFloat(min: number, max: number): number;
	rand(): number;
	shuffle<T>(array: T[]): T[];
	pick<T>(array: T[]): T;
	percentChance(percent: number): boolean;
	randomVariation(value: number, percentage: number): number;
}

function createDeterministicRNG(seed = 1): SimpleRNG {
	let state = seed % 2147483647;
	if (state <= 0) state += 2147483646;

	const next = () => {
		state = (state * 16807) % 2147483647;
		return state / 2147483647;
	};

	return {
		roll(max: number) {
			return Math.floor(next() * max) === 0;
		},
		randInt(min: number, max: number) {
			return Math.floor(next() * (max - min + 1)) + min;
		},
		randFloat(min: number, max: number) {
			return next() * (max - min) + min;
		},
		rand() {
			return next();
		},
		randomVariation(value: number, percentage: number) {
			const delta = value * percentage;
			return this.randFloat(value - delta, value + delta);
		},
		shuffle<T>(array: T[]) {
			const result = [...array];
			for (let i = result.length - 1; i > 0; i--) {
				const j = Math.floor(next() * (i + 1));
				[result[i], result[j]] = [result[j], result[i]];
			}
			return result;
		},
		pick<T>(array: T[]) {
			return array[Math.floor(next() * array.length)];
		},
		percentChance(percent: number) {
			return next() < percent / 100;
		}
	};
}

class SequenceRNG implements RNGProvider {
	private readonly fallback = new SeedableRNG(1);
	private randQueue: number[];

	constructor(randQueue: number[]) {
		this.randQueue = [...randQueue];
	}

	private nextRand() {
		if (this.randQueue.length > 0) {
			return this.randQueue.shift()!;
		}
		return this.fallback.rand();
	}

	rand(): number {
		return this.nextRand();
	}

	randFloat(min: number, max: number): number {
		return min + (max - min) * this.nextRand();
	}

	randInt(min: number, max: number): number {
		return Math.floor(this.nextRand() * (max - min + 1)) + min;
	}

	roll(max: number): boolean {
		return this.randInt(1, max) === 1;
	}

	shuffle<T>(array: T[]): T[] {
		return this.fallback.shuffle(array);
	}

	pick<T>(array: T[]): T {
		return this.fallback.pick(array);
	}

	percentChance(percent: number): boolean {
		return this.nextRand() < percent / 100;
	}

	randomVariation(value: number, percentage: number): number {
		const r = Math.max(0, Math.min(1, this.rand()));
		const delta = value * percentage;
		return value - delta + r * (2 * delta);
	}
}

describe('calcFishingTripStart', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('returns error when wanting to use flakes but none are present and allows retrying without flakes', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Sardine/Herring')!;

		const gearBank = makeGearBank({ bank: new Bank().add('Fishing bait', 5) });

		const res = calcFishingTripStart({
			gearBank,
			fish,
			maxTripLength: 1_000_000,
			quantityInput: 2,
			wantsToUseFlakes: true,
			powerfish: false,
			hasWildyEliteDiary: false
		});

		expect(typeof res).toBe('string');
		expect((res as string).toLowerCase()).toContain('spirit flake');

		vi.spyOn(Math, 'random').mockReturnValue(0);
		const ok = calcFishingTripStart({
			gearBank,
			fish,
			maxTripLength: 1_000_000,
			quantityInput: 2,
			wantsToUseFlakes: false,
			powerfish: false,
			hasWildyEliteDiary: false
		});

		expect(typeof ok).toBe('object');
		const result = ok as Exclude<typeof ok, string>;
		expect(result.quantity).toBeGreaterThan(0);
	});

	test('returns helpful message when final quantity is 0', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Tuna/Swordfish')!;

		const gearBank = makeGearBank({
			bank: new Bank(),
			skillsAsLevels: { fishing: 1 }
		});

		const res = calcFishingTripStart({
			gearBank,
			fish,
			maxTripLength: 1_000_000,
			quantityInput: 0,
			wantsToUseFlakes: false,
			powerfish: false,
			hasWildyEliteDiary: false
		});

		expect(typeof res).toBe('string');
		expect((res as string).toLowerCase()).toContain("can't fish any");
	});

	test('minnow scaling produces a valid quantity and duration', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Minnow')!;
		const gearBank = makeGearBank({ bank: new Bank().add('Sandworms', 50) });

		vi.spyOn(Math, 'random').mockReturnValue(0);

		const res = calcFishingTripStart({
			gearBank,
			fish,
			maxTripLength: 1_000_000,
			quantityInput: undefined,
			wantsToUseFlakes: false,
			powerfish: false,
			hasWildyEliteDiary: false
		});

		expect(typeof res).toBe('object');
		const out = res as Exclude<typeof res, string>;
		expect(Number.isFinite(out.duration)).toBeTruthy();
		expect(out.quantity).toBeGreaterThanOrEqual(1);
	});

	test('harpoon gear adds the appropriate boost message', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Shark')!;
		vi.spyOn(Math, 'random').mockReturnValue(0);

		const baseGearBank = makeGearBank();
		const base = calcFishingTripStart({
			gearBank: baseGearBank,
			fish,
			maxTripLength: 1_000_000,
			quantityInput: 5,
			wantsToUseFlakes: false,
			powerfish: false,
			hasWildyEliteDiary: false
		});

		expect(typeof base).toBe('object');
		const baseResult = base as Exclude<typeof base, string>;
		expect(baseResult.boosts.some(b => b.includes('harpoon'))).toBeFalsy();

		const harpoonGearBank = makeGearBank();
		harpoonGearBank.gear.skilling.equip('Dragon harpoon');

		const withHarpoon = calcFishingTripStart({
			gearBank: harpoonGearBank,
			fish,
			maxTripLength: 1_000_000,
			quantityInput: 5,
			wantsToUseFlakes: false,
			powerfish: false,
			hasWildyEliteDiary: false
		});

		expect(typeof withHarpoon).toBe('object');
		const harpoonResult = withHarpoon as Exclude<typeof withHarpoon, string>;
		expect(harpoonResult.boosts.some(b => b.includes('Dragon harpoon'))).toBeTruthy();
	});

	test('fish barrel in the bank applies the extended trip boost', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Lobster')!;
		vi.spyOn(Math, 'random').mockReturnValue(0);

		const noBarrel = calcFishingTripStart({
			gearBank: makeGearBank({ bank: new Bank() }),
			fish,
			maxTripLength: 1_000_000,
			quantityInput: undefined,
			wantsToUseFlakes: false,
			powerfish: false,
			hasWildyEliteDiary: false
		});

		expect(typeof noBarrel).toBe('object');
		const noBarrelResult = noBarrel as Exclude<typeof noBarrel, string>;
		expect(noBarrelResult.boosts.some(b => b.includes('Fish barrel'))).toBeFalsy();

		const withBarrel = calcFishingTripStart({
			gearBank: makeGearBank({ bank: new Bank().add('Fish barrel') }),
			fish,
			maxTripLength: 1_000_000,
			quantityInput: undefined,
			wantsToUseFlakes: false,
			powerfish: false,
			hasWildyEliteDiary: false
		});

		expect(typeof withBarrel).toBe('object');
		const withBarrelResult = withBarrel as Exclude<typeof withBarrel, string>;
		expect(withBarrelResult.boosts.some(b => b.includes('Fish barrel'))).toBeTruthy();
	});

	test('caps flakes to final quantity and records usage', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Sardine/Herring')!;
		vi.spyOn(Math, 'random').mockReturnValue(0);

		const gearBank = makeGearBank({ bank: new Bank().add('Fishing bait', 1).add('Spirit flakes', 5) });

		const res = calcFishingTripStart({
			gearBank,
			fish,
			maxTripLength: 1_000_000,
			quantityInput: 5,
			wantsToUseFlakes: true,
			powerfish: false,
			hasWildyEliteDiary: false
		});

		expect(typeof res).toBe('object');
		const out = res as Exclude<typeof res, string>;
		expect(out.quantity).toBeGreaterThanOrEqual(1);
		expect(out.flakesBeingUsed).toBeLessThanOrEqual(out.quantity);
		expect(out.isUsingSpiritFlakes).toBeTruthy();
		expect(out.spiritFlakePreference).toBe(true);
		expect(out.suppliesToRemove.amount('Spirit flakes')).toBe(out.flakesBeingUsed);
		expect(out.suppliesToRemove.amount('Fishing bait')).toBe(out.quantity);
	});

	test('shark lures adjust trip start and consume supplies', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Shark')!;
		vi.spyOn(Math, 'random').mockReturnValue(0);
		const bank = new Bank().add('Shark lure', 50);
		const gearBank = makeGearBank({ bank });
		const res = calcFishingTripStart({
			gearBank,
			fish,
			maxTripLength: 1_000_000,
			quantityInput: 25,
			wantsToUseFlakes: false,
			powerfish: false,
			hasWildyEliteDiary: false,
			sharkLureQuantity: 3
		});
		expect(typeof res).toBe('object');
		if (typeof res === 'string') {
			throw new Error('Expected shark lure trip result');
		}
		expect(res.sharkLureQuantity).toBe(3);
		expect(res.sharkLuresToConsume).toBeGreaterThan(0);
		expect(res.suppliesToRemove.amount('Shark lure')).toBe(res.sharkLuresToConsume);
		expect(res.sharkLuresToConsume).toBeLessThanOrEqual(bank.amount('Shark lure'));
		expect(res.boosts.some(boost => boost.includes('Shark lure'))).toBe(true);
	});

	test('powerfishing disables spirit flakes usage', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Trout/Salmon')!;
		vi.spyOn(Math, 'random').mockReturnValue(0);

		const gearBank = makeGearBank({ bank: new Bank().add('Feather', 25).add('Spirit flakes', 25) });

		const res = calcFishingTripStart({
			gearBank,
			fish,
			maxTripLength: 1_000_000,
			quantityInput: 10,
			wantsToUseFlakes: true,
			powerfish: true,
			hasWildyEliteDiary: false
		});

		expect(typeof res).toBe('object');
		const out = res as Exclude<typeof res, string>;
		expect(out.isPowerfishing).toBeTruthy();
		expect(out.isUsingSpiritFlakes).toBeFalsy();
		expect(out.flakesBeingUsed).toBeUndefined();
		expect(out.spiritFlakePreference).toBe(true);
	});

	test('barbarian fishing respects agility/strength thresholds', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Barbarian fishing')!;
		const rngPattern = [0.25, 0.05, 0.05, 0.4];
		const rngQueue = Array.from({ length: 2500 }, () => rngPattern).flat();

		const lowLevels = makeGearBank({
			bank: new Bank().add('Feather', 500),
			skillsAsLevels: { fishing: 80, agility: 29, strength: 29, cooking: 80 }
		});
		const salmonLevels = makeGearBank({
			bank: new Bank().add('Feather', 500),
			skillsAsLevels: { fishing: 80, agility: 30, strength: 30, cooking: 80 }
		});
		const sturgeonLevels = makeGearBank({
			bank: new Bank().add('Feather', 500),
			skillsAsLevels: { fishing: 80, agility: 45, strength: 45, cooking: 80 }
		});

		const low = calcFishingTripStart({
			gearBank: lowLevels,
			fish,
			maxTripLength: 60 * 60 * 1000,
			quantityInput: 200,
			wantsToUseFlakes: false,
			powerfish: true,
			hasWildyEliteDiary: false,
			rng: new SequenceRNG(rngQueue)
		});
		expect(typeof low).toBe('object');
		if (typeof low === 'string') {
			throw new Error('Expected trip data for low levels');
		}
		expect(low.catches[1]).toBe(0);
		expect(low.catches[2]).toBe(0);

		const salmon = calcFishingTripStart({
			gearBank: salmonLevels,
			fish,
			maxTripLength: 60 * 60 * 1000,
			quantityInput: 200,
			wantsToUseFlakes: false,
			powerfish: true,
			hasWildyEliteDiary: false,
			rng: new SequenceRNG(rngQueue)
		});
		expect(typeof salmon).toBe('object');
		if (typeof salmon === 'string') {
			throw new Error('Expected trip data for salmon levels');
		}
		expect(salmon.catches[1]).toBeGreaterThan(0);
		expect(salmon.catches[2]).toBe(0);

		const sturgeon = calcFishingTripStart({
			gearBank: sturgeonLevels,
			fish,
			maxTripLength: 60 * 60 * 1000,
			quantityInput: 200,
			wantsToUseFlakes: false,
			powerfish: true,
			hasWildyEliteDiary: false,
			rng: new SequenceRNG(rngQueue)
		});
		expect(typeof sturgeon).toBe('object');
		if (typeof sturgeon === 'string') {
			throw new Error('Expected trip data for sturgeon levels');
		}
		expect(sturgeon.catches[1]).toBeGreaterThan(0);
		expect(sturgeon.catches[2]).toBeGreaterThan(0);
	});

	test('barbarian cut-eat powerfishing sustains bait and awards expected XP', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Barbarian fishing')!;
		const rng = createDeterministicRNG(321);

		const gearBank = makeGearBank({
			bank: new Bank().add('Feather', 1),
			skillsAsLevels: { fishing: 99, cooking: 99 }
		});

		const res = calcFishingTripStart({
			gearBank,
			fish,
			maxTripLength: 60 * 60 * 1000,
			quantityInput: undefined,
			wantsToUseFlakes: false,
			powerfish: true,
			hasWildyEliteDiary: false,
			rng
		});

		expect(typeof res).toBe('object');
		const start = res as Exclude<typeof res, string>;
		expect(start.quantity).toBeGreaterThan(1);
		expect(start.suppliesToRemove.amount('Feather')).toBeLessThanOrEqual(1);

		const result = Fishing.util.calcFishingTripResult({
			fish,
			duration: start.duration,
			catches: start.catches,
			loot: start.loot,
			gearBank,
			rng: createDeterministicRNG(321),
			usedBarbarianCutEat: start.usedBarbarianCutEat,
			isPowerfishing: start.isPowerfishing
		});

		const fishingXP = result.updateBank.xpBank.amount('fishing');
		const cookingXP = result.updateBank.xpBank.amount('cooking');
		const agilityXP = result.updateBank.xpBank.amount('agility');
		const strengthXP = result.updateBank.xpBank.amount('strength');

		expect(Number.isInteger(cookingXP)).toBe(true);
		expect(cookingXP).toBeGreaterThan(0);

		const perHour = (xp: number) => Math.floor((xp * Time.Hour) / start.duration);

		expect(result.xpPerHour).toBe(toKMB(perHour(fishingXP)));
		expect(result.bonusXpPerHour.agility).toBe(toKMB(perHour(agilityXP)));
		expect(result.bonusXpPerHour.strength).toBe(toKMB(perHour(strengthXP)));
		expect(result.bonusXpPerHour.cooking).toBe(toKMB(perHour(cookingXP)));
	});

	test('spirit flakes are consumed even when no bonus fish are granted', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Sardine/Herring')!;
		let idx = 0;
		const rolls = [0, 0.99, 0.99];
		vi.spyOn(Math, 'random').mockImplementation(() => {
			const value = rolls[idx % rolls.length];
			idx++;
			return value;
		});

		const gearBank = makeGearBank({ bank: new Bank().add('Fishing bait', 10).add('Spirit flakes', 10) });

		const res = calcFishingTripStart({
			gearBank,
			fish,
			maxTripLength: 1_000_000,
			quantityInput: 5,
			wantsToUseFlakes: true,
			powerfish: false,
			hasWildyEliteDiary: false
		});

		expect(typeof res).toBe('object');
		const out = res as Exclude<typeof res, string>;
		expect(out.flakesBeingUsed).toBe(out.quantity);
		expect(out.suppliesToRemove.amount('Spirit flakes')).toBe(out.quantity);
	});

	test('seeded RNG produces deterministic trip start results', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Sardine/Herring')!;
		const attempt = () =>
			calcFishingTripStart({
				gearBank: makeGearBank({ bank: new Bank().add('Fishing bait', 100).add('Spirit flakes', 100) }),
				fish,
				maxTripLength: 1_000_000,
				quantityInput: 25,
				wantsToUseFlakes: true,
				powerfish: false,
				hasWildyEliteDiary: false,
				rng: new SeedableRNG(123)
			});

		const res1 = attempt();
		const res2 = attempt();

		expect(typeof res1).toBe('object');
		expect(typeof res2).toBe('object');
		if (typeof res1 === 'string' || typeof res2 === 'string') {
			throw new Error('Expected deterministic trip start results');
		}

		expect(res1.duration).toBe(res2.duration);
		expect(res1.quantity).toBe(res2.quantity);
		expect(res1.catches).toStrictEqual(res2.catches);
		expect(res1.loot).toStrictEqual(res2.loot);
		expect(res1.blessingExtra).toBe(res2.blessingExtra);
		expect(res1.flakeExtra).toBe(res2.flakeExtra);
		expect(res1.flakesBeingUsed).toBe(res2.flakesBeingUsed);
		expect(res1.boosts).toStrictEqual(res2.boosts);
		expect(res1.isPowerfishing).toBe(res2.isPowerfishing);
		expect(res1.isUsingSpiritFlakes).toBe(res2.isUsingSpiritFlakes);
		expect(res1.spiritFlakePreference).toBe(res2.spiritFlakePreference);
		expect(res1.suppliesToRemove.equals(res2.suppliesToRemove)).toBe(true);
	});

	test('limited trip length reduces catches without failing the request', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Tuna/Swordfish')!;
		vi.spyOn(Math, 'random').mockReturnValue(0);

		const gearBank = makeGearBank();

		const res = calcFishingTripStart({
			gearBank,
			fish,
			maxTripLength: 1_000,
			quantityInput: 10,
			wantsToUseFlakes: false,
			powerfish: false,
			hasWildyEliteDiary: false
		});

		expect(typeof res).toBe('object');
		const out = res as Exclude<typeof res, string>;
		expect(out.quantity).toBeGreaterThanOrEqual(1);
		expect(out.quantity).toBeLessThan(10);
	});

	test('dark crab elite diary boost adjusts probabilities and records the diary bonus', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Dark crab')!;
		const rngQueue = Array.from({ length: 800 }, () => 0.05);
		const rng = new SequenceRNG(rngQueue);

		const base = calcFishingTripStart({
			gearBank: makeGearBank({ bank: new Bank().add('Dark fishing bait', 500) }),
			fish,
			maxTripLength: 30 * Time.Minute,
			quantityInput: 200,
			wantsToUseFlakes: false,
			powerfish: false,
			hasWildyEliteDiary: false,
			rng: new SequenceRNG(rngQueue)
		});

		const elite = calcFishingTripStart({
			gearBank: makeGearBank({ bank: new Bank().add('Dark fishing bait', 500) }),
			fish,
			maxTripLength: 30 * Time.Minute,
			quantityInput: 200,
			wantsToUseFlakes: false,
			powerfish: false,
			hasWildyEliteDiary: true,
			rng
		});

		expect(typeof base).toBe('object');
		expect(typeof elite).toBe('object');
		if (typeof base === 'string' || typeof elite === 'string') {
			throw new Error('Expected successful trip calculations for dark crab');
		}

		expect(elite.quantity).toBeGreaterThanOrEqual(base.quantity);
		expect(elite.boosts).toContain('Increased dark crab catch rate from Elite Wilderness Diary');
	});

	test('fishing cape halves barbarian fishing banking time', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Barbarian fishing')!;
		const rngQueue = Array.from({ length: 5_000 }, () => 0.05);

		const withoutCape = makeGearBank({ bank: new Bank().add('Feather', 5_000) });
		const withCape = makeGearBank({ bank: new Bank().add('Feather', 5_000) });
		withCape.gear.skilling.equip('Fishing cape');

		const base = calcFishingTripStart({
			gearBank: withoutCape,
			fish,
			maxTripLength: 30 * Time.Minute,
			quantityInput: 500,
			wantsToUseFlakes: false,
			powerfish: false,
			hasWildyEliteDiary: false,
			rng: new SequenceRNG(rngQueue)
		});

		const boosted = calcFishingTripStart({
			gearBank: withCape,
			fish,
			maxTripLength: 30 * Time.Minute,
			quantityInput: 500,
			wantsToUseFlakes: false,
			powerfish: false,
			hasWildyEliteDiary: false,
			rng: new SequenceRNG(rngQueue)
		});

		expect(typeof base).toBe('object');
		expect(typeof boosted).toBe('object');
		if (typeof base === 'string' || typeof boosted === 'string') {
			throw new Error('Expected trip data for barbarian fishing cape comparison');
		}

		expect(boosted.duration).toBeLessThan(base.duration);
	});

	test('powerfishing tuna uses the accelerated roll timing', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Tuna/Swordfish')!;
		const rngQueue = Array.from({ length: 3_000 }, () => 0.2);

		const passive = calcFishingTripStart({
			gearBank: makeGearBank(),
			fish,
			maxTripLength: 30 * Time.Minute,
			quantityInput: 400,
			wantsToUseFlakes: false,
			powerfish: false,
			hasWildyEliteDiary: false,
			rng: new SequenceRNG(rngQueue)
		});

		const aggressive = calcFishingTripStart({
			gearBank: makeGearBank(),
			fish,
			maxTripLength: 30 * Time.Minute,
			quantityInput: 400,
			wantsToUseFlakes: false,
			powerfish: true,
			hasWildyEliteDiary: false,
			rng: new SequenceRNG(rngQueue)
		});

		expect(typeof passive).toBe('object');
		expect(typeof aggressive).toBe('object');
		if (typeof passive === 'string' || typeof aggressive === 'string') {
			throw new Error('Expected trip data for tuna powerfishing comparison');
		}

		expect(aggressive.isPowerfishing).toBe(true);
		expect(aggressive.duration).toBeLessThan(passive.duration);
	});

	test('returns informative error when lacking feathers for feather bait spots', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Trout/Salmon')!;
		const res = calcFishingTripStart({
			gearBank: makeGearBank({ bank: new Bank() }),
			fish,
			maxTripLength: 30 * Time.Minute,
			quantityInput: 10,
			wantsToUseFlakes: false,
			powerfish: false,
			hasWildyEliteDiary: false
		});

		expect(typeof res).toBe('string');
		expect((res as string).includes('Feather')).toBe(true);
	});

	test('returns informative error when lacking other bait types', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Dark crab')!;
		const res = calcFishingTripStart({
			gearBank: makeGearBank({ bank: new Bank() }),
			fish,
			maxTripLength: 30 * Time.Minute,
			quantityInput: 10,
			wantsToUseFlakes: false,
			powerfish: false,
			hasWildyEliteDiary: false
		});

		expect(typeof res).toBe('string');
		expect((res as string).includes('Dark fishing bait')).toBe(true);
	});
});

describe('calcFishingTripResult', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('shark lure quantity reduces XP per catch', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Shark')!;
		const gearBank = makeGearBank();
		const catches = [10];
		const result = Fishing.util.calcFishingTripResult({
			fish,
			duration: 1_000,
			catches,
			loot: catches,
			gearBank,
			sharkLureQuantity: 1
		});
		expect(result.updateBank.xpBank.amount('fishing')).toBeCloseTo(275, 5);
	});

	test('shark lure quantity scales pet chance', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Shark')!;
		const gearBank = makeGearBank();
		const spy = vi.spyOn(utilModule, 'skillingPetDropRate');
		Fishing.util.calcFishingTripResult({
			fish,
			duration: 1_000,
			catches: [1],
			loot: [1],
			gearBank,
			sharkLureQuantity: 0
		});
		expect(spy).toHaveBeenLastCalledWith(gearBank, 'fishing', 82_243);
		Fishing.util.calcFishingTripResult({
			fish,
			duration: 1_000,
			catches: [1],
			loot: [1],
			gearBank,
			sharkLureQuantity: 5
		});
		expect(spy).toHaveBeenLastCalledWith(gearBank, 'fishing', 493_458);
	});

	test('seeded RNG produces deterministic trip results', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Sardine/Herring')!;

		const attempt = () => {
			const gearBank = makeGearBank({
				bank: new Bank().add('Fishing bait', 100).add('Spirit flakes', 100)
			});
			const tripStart = calcFishingTripStart({
				gearBank,
				fish,
				maxTripLength: 1_000_000,
				quantityInput: 25,
				wantsToUseFlakes: true,
				powerfish: false,
				hasWildyEliteDiary: false,
				rng: new SeedableRNG(123)
			});
			if (typeof tripStart === 'string') {
				throw new Error('Expected deterministic trip start results');
			}

			const result = Fishing.util.calcFishingTripResult({
				fish,
				duration: tripStart.duration,
				catches: tripStart.catches,
				loot: tripStart.loot,
				gearBank,
				rng: new SeedableRNG(123),
				blessingExtra: tripStart.blessingExtra,
				flakeExtra: tripStart.flakeExtra,
				usedBarbarianCutEat: tripStart.usedBarbarianCutEat,
				isPowerfishing: tripStart.isPowerfishing
			});

			return { tripStart, result };
		};

		const run1 = attempt();
		const run2 = attempt();

		expect(run1.result.totalCatches).toBe(run2.result.totalCatches);
		expect(run1.result.messages).toStrictEqual(run2.result.messages);
		expect(run1.result.updateBank.itemLootBank.equals(run2.result.updateBank.itemLootBank)).toBe(true);
		expect(run1.result.updateBank.xpBank.xpList).toStrictEqual(run2.result.updateBank.xpBank.xpList);
		expect(run1.result.blessingExtra).toBe(run2.result.blessingExtra);
		expect(run1.result.flakeExtra).toBe(run2.result.flakeExtra);
	});

	test('reports blessing and flake gains in completion messages', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Sardine/Herring')!;
		const gearBank = makeGearBank({
			bank: new Bank().add('Fishing bait', 5).add('Spirit flakes', 5)
		});
		gearBank.gear.skilling.equip("Rada's blessing 4");

		const start = calcFishingTripStart({
			gearBank,
			fish,
			maxTripLength: 1_000_000,
			quantityInput: 1,
			wantsToUseFlakes: true,
			powerfish: false,
			hasWildyEliteDiary: false,
			rng: new SequenceRNG([0, 0, 0])
		});

		expect(typeof start).toBe('object');
		if (typeof start === 'string') {
			throw new Error('Expected trip start data');
		}

		expect(start.blessingExtra).toBeGreaterThanOrEqual(1);
		expect(start.flakeExtra).toBeGreaterThanOrEqual(1);

		const result = Fishing.util.calcFishingTripResult({
			fish,
			duration: start.duration,
			catches: start.catches,
			loot: start.loot,
			gearBank,
			rng: new SeedableRNG(5),
			blessingExtra: start.blessingExtra,
			flakeExtra: start.flakeExtra,
			usedBarbarianCutEat: start.usedBarbarianCutEat,
			isPowerfishing: start.isPowerfishing
		});

		expect(result.blessingExtra).toBe(start.blessingExtra);
		expect(result.flakeExtra).toBe(start.flakeExtra);
		expect(
			result.messages.some(msg => msg.includes("Rada's blessing") && msg.includes(start.blessingExtra.toString()))
		).toBe(true);
		expect(
			result.messages.some(msg => msg.includes('Spirit flakes') && msg.includes(start.flakeExtra.toString()))
		).toBe(true);
	});

	test('barbarian cut-eat flag persists even if cooking level increases mid-trip', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Barbarian fishing')!;
		const schedulingGear = makeGearBank({
			bank: new Bank().add('Feather', 200),
			skillsAsLevels: { fishing: 99, cooking: 79 }
		});

		const start = calcFishingTripStart({
			gearBank: schedulingGear,
			fish,
			maxTripLength: 30 * 60 * 1000,
			quantityInput: 100,
			wantsToUseFlakes: false,
			powerfish: true,
			hasWildyEliteDiary: false,
			rng: createDeterministicRNG(99)
		});
		expect(typeof start).toBe('object');
		if (typeof start === 'string') {
			throw new Error('Expected trip data when scheduling');
		}
		expect(start.usedBarbarianCutEat).toBe(false);

		const finishingGear = makeGearBank({
			bank: new Bank().add('Feather', 200),
			skillsAsLevels: { fishing: 99, cooking: 99 }
		});

		const result = Fishing.util.calcFishingTripResult({
			fish,
			duration: start.duration,
			catches: start.catches,
			loot: start.loot,
			gearBank: finishingGear,
			rng: createDeterministicRNG(99),
			usedBarbarianCutEat: start.usedBarbarianCutEat,
			isPowerfishing: start.isPowerfishing
		});

		expect(result.updateBank.xpBank.amount('cooking')).toBe(0);
	});

	test('skips zero entries and subfishes that the player cannot handle', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Barbarian fishing')!;
		const gearBank = makeGearBank({
			bank: new Bank().add('Feather', 500),
			skillsAsLevels: { fishing: 80, agility: 20, strength: 20, cooking: 1 }
		});
		const noLuckRNG: RNGProvider = {
			rand: () => 1,
			randFloat: (_min, max) => max,
			randInt: (_min, max) => max,
			roll: () => false,
			shuffle: <T>(array: T[]) => array,
			pick: <T>(array: T[]) => array[0],
			percentChance: () => false,
			randomVariation: (value, percentage) => value - value * percentage
		};

		const result = Fishing.util.calcFishingTripResult({
			fish,
			duration: Time.Minute,
			catches: [0, 5, 7],
			loot: [0, 5, 7],
			gearBank,
			rng: noLuckRNG,
			usedBarbarianCutEat: false,
			isPowerfishing: false
		});

		expect(result.totalCatches).toBe(12);
		expect(result.updateBank.itemLootBank.amount(fish.subfishes![0].id)).toBe(0);
		expect(result.updateBank.itemLootBank.amount(fish.subfishes![1].id)).toBe(0);
		expect(result.updateBank.itemLootBank.amount(fish.subfishes![2].id)).toBe(0);
		expect(result.updateBank.xpBank.amount('fishing')).toBe(0);
		expect(result.updateBank.xpBank.amount('agility')).toBe(0);
		expect(result.updateBank.xpBank.amount('strength')).toBe(0);
		expect(result.bonusXpPerHour).toEqual({});
	});

	test('awards tertiary loot, pets, angler bonus, and clue scrolls when applicable', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Shark')!;
		const gearBank = makeGearBank();
		gearBank.gear.skilling.equip('Angler hat');
		gearBank.gear.skilling.equip('Angler top');
		gearBank.gear.skilling.equip('Angler waders');
		gearBank.gear.skilling.equip('Angler boots');
		gearBank.gear.skilling.equip("Rada's blessing 4");

		const luckyRNG: RNGProvider = {
			rand: () => 0,
			randFloat: (min, _max) => min,
			randInt: (min, _max) => min,
			roll: () => true,
			shuffle: <T>(array: T[]) => array,
			pick: <T>(array: T[]) => array[0],
			percentChance: () => true,
			randomVariation: (value, percentage) => value + value * percentage
		};

		const clueSpy = vi.spyOn(addSkillingClueToLootModule, 'default');

		const result = Fishing.util.calcFishingTripResult({
			fish,
			duration: Time.Hour,
			catches: [3],
			loot: [3],
			gearBank,
			rng: luckyRNG,
			blessingExtra: 2,
			flakeExtra: 1,
			usedBarbarianCutEat: false,
			isPowerfishing: false
		});

		expect(result.messages.some(msg => msg.includes('Bonus XP'))).toBe(true);
		expect(result.messages.some(msg => msg.includes("Rada's blessing"))).toBe(true);
		expect(result.messages.some(msg => msg.includes('Spirit flakes'))).toBe(true);
		expect(result.updateBank.itemLootBank.amount(EItem.BIG_SHARK)).toBeGreaterThanOrEqual(1);
		expect(result.updateBank.itemLootBank.amount('Heron')).toBe(3);
		expect(clueSpy).toHaveBeenCalledOnce();
	});

	test('powerfishing drops loot while still granting experience', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Sardine/Herring')!;
		const gearBank = makeGearBank({ bank: new Bank().add('Fishing bait', 10) });

		const result = Fishing.util.calcFishingTripResult({
			fish,
			duration: Time.Minute,
			catches: [3, 2],
			loot: [3, 2],
			gearBank,
			usedBarbarianCutEat: false,
			isPowerfishing: true
		});

		expect(result.updateBank.itemLootBank.amount(EItem.RAW_SARDINE)).toBe(0);
		expect(result.updateBank.itemLootBank.amount(EItem.RAW_HERRING)).toBe(0);
		expect(result.updateBank.xpBank.amount('fishing')).toBeGreaterThan(0);
	});

	test('minnow catches are converted into the expected ranged quantities', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Minnow')!;
		const gearBank = makeGearBank({ skillsAsLevels: { fishing: 96 } });
		const rng: RNGProvider = {
			rand: () => 0,
			randFloat: (min, _max) => min,
			randInt: (_min, max) => max,
			roll: () => false,
			shuffle: <T>(array: T[]) => array,
			pick: <T>(array: T[]) => array[0],
			percentChance: () => false,
			randomVariation: value => value
		};

		const result = Fishing.util.calcFishingTripResult({
			fish,
			duration: Time.Minute,
			catches: [4],
			loot: [0],
			gearBank,
			rng,
			usedBarbarianCutEat: false,
			isPowerfishing: false
		});

		const minnowAmount = result.updateBank.itemLootBank.amount(EItem.MINNOW);
		expect(minnowAmount).toBeGreaterThanOrEqual(44);
		expect(minnowAmount).toBeLessThanOrEqual(52);
	});

	test('karambwanji catches scale with fishing level', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Karambwanji')!;
		const gearBank = makeGearBank({ skillsAsLevels: { fishing: 99 } });
		const result = Fishing.util.calcFishingTripResult({
			fish,
			duration: Time.Minute,
			catches: [2],
			loot: [2],
			gearBank,
			rng: new SeedableRNG(1),
			usedBarbarianCutEat: false,
			isPowerfishing: false
		});

		expect(result.updateBank.itemLootBank.amount(EItem.RAW_KARAMBWANJI)).toBe(40);
	});

	test('zero duration trips report zero hourly rates', () => {
		const fish = Fishing.Fishes.find(f => f.name === 'Sardine/Herring')!;
		const gearBank = makeGearBank();
		const result = Fishing.util.calcFishingTripResult({
			fish,
			duration: 0,
			catches: [5, 0],
			loot: [5, 0],
			gearBank,
			rng: new SeedableRNG(1),
			usedBarbarianCutEat: false,
			isPowerfishing: false
		});

		expect(result.xpPerHour).toBe(toKMB(0));
		expect(result.bonusXpPerHour).toEqual({});
	});
});

describe('fishing util helpers', () => {
	test('calcRadasBlessingBoost recognises equipped blessings and defaults when none are worn', () => {
		const blessed = makeGearBank();
		blessed.gear.skilling.equip("Rada's blessing 2");
		const none = makeGearBank();

		expect(calcRadasBlessingBoost(blessed)).toEqual({ blessingEquipped: true, blessingChance: 4 });
		expect(calcRadasBlessingBoost(none)).toEqual({ blessingEquipped: false, blessingChance: 0 });
	});

	test('calcMinnowQuantityRange picks the correct bracket for varying fishing levels', () => {
		const high = makeGearBank({ skillsAsLevels: { fishing: 96 } });
		const mid = makeGearBank({ skillsAsLevels: { fishing: 85 } });
		const low = makeGearBank({ skillsAsLevels: { fishing: 10 } });

		expect(calcMinnowQuantityRange(high)).toEqual([11, 13]);
		expect(calcMinnowQuantityRange(mid)).toEqual([10, 11]);
		expect(calcMinnowQuantityRange(low)).toEqual([10, 10]);
	});

	test('calcAnglerBoostPercent totals the equipped set bonuses', () => {
		const fullSet = makeGearBank();
		fullSet.gear.skilling.equip('Angler hat');
		fullSet.gear.skilling.equip('Angler top');
		fullSet.gear.skilling.equip('Angler waders');
		fullSet.gear.skilling.equip('Angler boots');

		const partial = makeGearBank();
		partial.gear.skilling.equip('Angler hat');
		partial.gear.skilling.equip('Angler top');

		expect(calcAnglerBoostPercent(fullSet)).toBe(2.5);
		expect(calcAnglerBoostPercent(partial)).toBe(1.2);
	});

	test('calcAnglerBoostPercent only counts pieces in the skilling gear', () => {
		const gearBank = makeGearBank();
		gearBank.gear.melee.equip('Angler hat');
		expect(calcAnglerBoostPercent(gearBank)).toBe(0);

		gearBank.gear.skilling.equip('Angler hat');
		expect(calcAnglerBoostPercent(gearBank)).toBe(0.4);
	});

	test('calcAnglerBonusXP returns the expected bonus and respects rounding', () => {
		const gearBank = makeGearBank();
		gearBank.gear.skilling.equip('Angler top');

		const baseResult = calcAnglerBonusXP({ gearBank, xp: 200 });
		expect(baseResult.percent).toBe(0.8);
		expect(baseResult.bonusXP).toBeCloseTo(1.6);
		expect(baseResult.totalXP).toBeCloseTo(201.6);

		const ceilResult = calcAnglerBonusXP({ gearBank, xp: 200, roundingMethod: 'ceil' });
		expect(ceilResult.bonusXP).toBe(2);
		expect(ceilResult.totalXP).toBe(202);

		const floorResult = calcAnglerBonusXP({ gearBank, xp: 200, roundingMethod: 'floor' });
		expect(floorResult.bonusXP).toBe(1);
	});

	test('calcLeapingExpectedCookingXP handles zero quantity and missing configurations', () => {
		expect(
			calcLeapingExpectedCookingXP({
				id: EItem.LEAPING_TROUT,
				quantity: 0,
				cookingLevel: 70
			})
		).toBe(0);
		expect(
			calcLeapingExpectedCookingXP({
				id: 123456,
				quantity: 5,
				cookingLevel: 70
			})
		).toBe(0);
	});

	test('calcLeapingExpectedCookingXP rounds fractional successes correctly with and without RNG', () => {
		const withoutRNG = calcLeapingExpectedCookingXP({
			id: EItem.LEAPING_TROUT,
			quantity: 1,
			cookingLevel: 75
		});
		const withRNG = calcLeapingExpectedCookingXP({
			id: EItem.LEAPING_TROUT,
			quantity: 1,
			cookingLevel: 70,
			xpPerSuccess: 20,
			rng: {
				rand: () => 0,
				randFloat: () => 0,
				randInt: () => 0,
				roll: () => false,
				shuffle: <T>(array: T[]) => array,
				pick: <T>(array: T[]) => array[0],
				percentChance: () => false,
				randomVariation: value => value
			}
		});

		expect(withoutRNG).toBe(10);
		expect(withRNG).toBe(20);
	});

	test('calcLeapingExpectedBait respects quantity and configuration presence', () => {
		expect(calcLeapingExpectedBait(EItem.LEAPING_TROUT, 0, 70)).toBe(0);
		expect(calcLeapingExpectedBait(123456, 10, 70)).toBe(0);

		const level = 70;
		const chance = Math.min(level * 0.0067, 1);
		const expected = 10 * chance * 1.5;
		expect(calcLeapingExpectedBait(EItem.LEAPING_TROUT, 10, level)).toBeCloseTo(expected);
	});
});
