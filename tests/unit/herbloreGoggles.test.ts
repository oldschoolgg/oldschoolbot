import type { RNGProvider } from 'node-rng';
import { describe, expect, test, vi } from 'vitest';

import Herblore from '@/lib/skilling/skills/herblore/herblore.js';
import { calculatePrescriptionGogglesSavedItems } from '@/tasks/minions/herbloreActivity.js';

function getMixable(name: string) {
	return Herblore.Mixables.find(mixable => mixable.item.name === name)!;
}

function mockRng(result: boolean): RNGProvider {
	return {
		percentChance: vi.fn(() => result)
	} as unknown as RNGProvider;
}

describe('Prescription goggles', () => {
	test('saves stackable secondaries once per potion proc', () => {
		const rng = mockRng(true);
		const savedItems = calculatePrescriptionGogglesSavedItems(getMixable('Anti-venom(4)'), 2, rng);

		expect(savedItems.amount("Zulrah's scales")).toEqual(40);
		expect(savedItems.amount('Antidote++(4)')).toEqual(0);
		expect(rng.percentChance).toHaveBeenCalledTimes(2);
	});

	test('saves special-case herbs modelled as finished antidotes', () => {
		const alwaysSave = mockRng(true);

		const antidotePlusSaved = calculatePrescriptionGogglesSavedItems(getMixable('Antidote+(4)'), 1, alwaysSave);
		expect(antidotePlusSaved.amount('Toadflax')).toEqual(1);
		expect(antidotePlusSaved.amount('Yew roots')).toEqual(1);
		expect(antidotePlusSaved.amount('Coconut milk')).toEqual(0);

		const antidotePlusPlusSaved = calculatePrescriptionGogglesSavedItems(
			getMixable('Antidote++(4)'),
			1,
			alwaysSave
		);
		expect(antidotePlusPlusSaved.amount('Irit leaf')).toEqual(1);
		expect(antidotePlusPlusSaved.amount('Magic roots')).toEqual(1);
		expect(antidotePlusPlusSaved.amount('Coconut milk')).toEqual(0);
	});

	test('only saves valid special-case inputs for complex recipes', () => {
		const alwaysSave = mockRng(true);

		const superCombatSaved = calculatePrescriptionGogglesSavedItems(
			getMixable('Super combat potion(4)'),
			1,
			alwaysSave
		);
		expect(superCombatSaved.amount('Torstol')).toEqual(1);
		expect(superCombatSaved.amount('Super attack(4)')).toEqual(0);
		expect(superCombatSaved.amount('Super strength (4)')).toEqual(0);
		expect(superCombatSaved.amount('Super defence (4)')).toEqual(0);

		const weaponPoisonSaved = calculatePrescriptionGogglesSavedItems(
			getMixable('Weapon poison(++)'),
			1,
			alwaysSave
		);
		expect(weaponPoisonSaved.amount('Cave nightshade')).toEqual(1);
		expect(weaponPoisonSaved.amount('Poison ivy berries')).toEqual(1);
		expect(weaponPoisonSaved.amount('Coconut milk')).toEqual(0);
	});

	test('does not save excluded ingredients', () => {
		const serumSaved = calculatePrescriptionGogglesSavedItems(getMixable('Serum 207 (3)'), 1, mockRng(true));

		expect(serumSaved.amount('Ashes')).toEqual(0);
	});
});
