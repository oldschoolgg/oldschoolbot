import type { RNGProvider } from 'node-rng';
import { describe, expect, test, vi } from 'vitest';

import Herblore from '@/lib/skilling/skills/herblore/herblore.js';
import Crush from '@/lib/skilling/skills/herblore/mixables/crush.js';
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
	test.each(Crush)('does not save ingredients when crushing $item.name', mixable => {
		const rng = mockRng(true);
		const savedItems = calculatePrescriptionGogglesSavedItems(mixable, 10, rng);

		expect(savedItems.length).toEqual(0);
		expect(rng.percentChance).not.toHaveBeenCalled();
	});

	test.each(['Guam leaf', 'Guam potion (unf)', 'Guam tar'])('does not save ingredients when making %s', name => {
		const rng = mockRng(true);
		const savedItems = calculatePrescriptionGogglesSavedItems(getMixable(name), 10, rng);

		expect(savedItems.length).toEqual(0);
		expect(rng.percentChance).not.toHaveBeenCalled();
	});

	test('saves secondaries when making barbarian mixes', () => {
		const savedItems = calculatePrescriptionGogglesSavedItems(getMixable('Attack mix(2)'), 2, mockRng(true));

		expect(savedItems.amount('Roe')).toEqual(2);
		expect(savedItems.amount('Attack potion(2)')).toEqual(0);
	});

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
