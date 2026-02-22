import { describe, expect, test } from 'vitest';

import { diaries } from '@/lib/diaries.js';
import {
	calculateGlassblowingPlan,
	calculateStealingArtefactsXpPerHour,
	canUseStealingArtefactsTeleport,
	getInterpolatedCapXpPerHour,
	getStealingArtefactsDeliveriesPerHour,
	stealingArtefactsCaps
} from '@/lib/minions/data/stealingArtefacts.js';

describe('stealing artefacts caps', () => {
	test('returns exact cap values at bracket levels', () => {
		for (const cap of stealingArtefactsCaps) {
			expect(getInterpolatedCapXpPerHour(cap.level, 'base')).toBe(cap.base);
			expect(getInterpolatedCapXpPerHour(cap.level, 'teleport')).toBe(cap.teleport);
		}
	});

	test('interpolates midpoint caps', () => {
		const lower = stealingArtefactsCaps[0];
		const upper = stealingArtefactsCaps[1];
		const level = 52;
		const expectedBase =
			lower.base + ((level - lower.level) * (upper.base - lower.base)) / (upper.level - lower.level);
		const expectedTeleport =
			lower.teleport + ((level - lower.level) * (upper.teleport - lower.teleport)) / (upper.level - lower.level);

		expect(getInterpolatedCapXpPerHour(level, 'base')).toBeCloseTo(expectedBase);
		expect(getInterpolatedCapXpPerHour(level, 'teleport')).toBeCloseTo(expectedTeleport);
	});
});

describe('stealing artefacts teleport eligibility', () => {
	test('accepts memoirs or book when option enabled', () => {
		expect(
			canUseStealingArtefactsTeleport({
				teleportOptionEnabled: true,
				hasMemoirs: true,
				hasBook: false,
				questCompleted: true
			})
		).toBe(true);
		expect(
			canUseStealingArtefactsTeleport({
				teleportOptionEnabled: true,
				hasMemoirs: false,
				hasBook: true,
				questCompleted: true
			})
		).toBe(true);
	});

	test('rejects teleport when requirements are missing', () => {
		expect(
			canUseStealingArtefactsTeleport({
				teleportOptionEnabled: true,
				hasMemoirs: false,
				hasBook: false,
				questCompleted: true
			})
		).toBe(false);
	});
});

describe('stealing artefacts delivery rates', () => {
	test('uses fixed deliveries per hour', () => {
		expect(
			getStealingArtefactsDeliveriesPerHour({ teleportEligible: false, hasGraceful: true, stamina: true })
		).toBe(48);
		expect(
			getStealingArtefactsDeliveriesPerHour({ teleportEligible: true, hasGraceful: true, stamina: true })
		).toBe(55);
	});

	test('applies penalties when missing graceful or stamina', () => {
		expect(
			getStealingArtefactsDeliveriesPerHour({ teleportEligible: false, hasGraceful: false, stamina: true })
		).toBeCloseTo(33.6);
		expect(
			getStealingArtefactsDeliveriesPerHour({ teleportEligible: false, hasGraceful: true, stamina: false })
		).toBeCloseTo(33.6);
		expect(
			getStealingArtefactsDeliveriesPerHour({ teleportEligible: true, hasGraceful: false, stamina: false })
		).toBeCloseTo(26.95);
	});
});

describe('stealing artefacts XP capping', () => {
	test('caps final XP/hr at base cap', () => {
		const result = calculateStealingArtefactsXpPerHour({
			thievingLevel: 99,
			teleportEligible: false,
			hasGraceful: true,
			stamina: true
		});
		expect(result.finalXpPerHour).toBe(result.capXpPerHour);
		expect(result.capXpPerHour).toBe(226_080);
	});

	test('caps final XP/hr at teleport cap', () => {
		const result = calculateStealingArtefactsXpPerHour({
			thievingLevel: 99,
			teleportEligible: true,
			hasGraceful: true,
			stamina: true
		});
		expect(result.finalXpPerHour).toBe(result.capXpPerHour);
		expect(result.capXpPerHour).toBe(261_000);
	});
});

describe('stealing artefacts diary integration', () => {
	test('adds Kourend & Kebos hard diary requirement', () => {
		const diary = diaries.find(entry => entry.name === 'Kourend & Kebos');
		expect(diary?.hard.minigameReqs?.stealing_artefacts).toBe(1);
	});
});

describe('stealing artefacts glassblowing', () => {
	test('rejects glassblowing when Crafting is too low', () => {
		const plan = calculateGlassblowingPlan({
			productKey: 'empty_light_orb',
			hours: 1,
			availableMoltenGlass: 1000,
			craftingLevel: 1
		});
		expect(plan.success).toBe(false);
	});

	test('empty_light_orb produces 1000 items per hour', () => {
		const plan = calculateGlassblowingPlan({
			productKey: 'empty_light_orb',
			hours: 1,
			availableMoltenGlass: 2000,
			craftingLevel: 99
		});
		if (!plan.success) throw new Error(plan.error);
		expect(plan.itemsMade).toBe(1000);
		expect(plan.moltenGlassUsed).toBe(1000);
	});

	test('reduces duration to available molten glass', () => {
		const plan = calculateGlassblowingPlan({
			productKey: 'beer_glass',
			hours: 3,
			availableMoltenGlass: 2000,
			craftingLevel: 99
		});
		if (!plan.success) throw new Error(plan.error);
		expect(plan.hours).toBeCloseTo(2);
		expect(plan.itemsMade).toBe(2000);
	});
});
