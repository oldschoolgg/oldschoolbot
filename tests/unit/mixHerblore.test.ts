import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import Herblore from '@/lib/skilling/skills/herblore/herblore.js';
import { mockMUser } from './userutil.js';

describe('Herblore Mixing', () => {
	test('All mixables have required properties', () => {
		for (const mixable of Herblore.Mixables) {
			expect(mixable.item).toBeDefined();
			expect(mixable.level).toBeGreaterThan(0);
			expect(mixable.xp).toBeGreaterThanOrEqual(0);
			expect(mixable.inputItems).toBeDefined();
			expect(mixable.tickRate).toBeGreaterThan(0);
		}
	});

	test('Potions with alternatives have both items defined', () => {
		for (const mixable of Herblore.Mixables) {
			if (mixable.alternatives) {
				for (const [original, alternative] of Object.entries(mixable.alternatives)) {
					expect(alternative).toBeDefined();
					const inputNames = mixable.inputItems.items().map(([item]) => item.name);
					expect(inputNames).toContain(original);
				}
			}
		}
	});

	test('Super combat resolves to Torstol when user has it', () => {
		const superCombat = Herblore.Mixables.find(m => m.aliases.includes('super combat'));
		expect(superCombat).toBeDefined();
		expect(superCombat!.alternatives).toBeDefined();

		const userWithTorstol = mockMUser({
			bank: new Bank({
				'Super attack(4)': 10,
				'Super strength (4)': 10,
				'Super defence (4)': 10,
				Torstol: 10
			}),
		});

		const resolvedRequiredItems = new Bank();
		for (const [item, qty] of superCombat!.inputItems.items()) {
			const itemName = item.name;
			if (userWithTorstol.owns(new Bank({ [itemName]: qty }))) {
				resolvedRequiredItems.add(itemName, qty);
			} else if (superCombat!.alternatives && superCombat!.alternatives[itemName]) {
				const altItemName = superCombat!.alternatives[itemName];
				if (userWithTorstol.owns(new Bank({ [altItemName]: qty }))) {
					resolvedRequiredItems.add(altItemName, qty);
				} else {
					resolvedRequiredItems.add(itemName, qty);
				}
			} else {
				resolvedRequiredItems.add(itemName, qty);
			}
		}

		expect(resolvedRequiredItems.amount('Torstol')).toBe(1);
		expect(resolvedRequiredItems.amount('Torstol potion (unf)')).toBe(0);
	});

	test('Super combat resolves to Torstol potion (unf) when user has alternative', () => {
		const superCombat = Herblore.Mixables.find(m => m.aliases.includes('super combat'));

		const userWithUnf = mockMUser({
			bank: new Bank({
				'Super attack(4)': 10,
				'Super strength (4)': 10,
				'Super defence (4)': 10,
				'Torstol potion (unf)': 10
			}),
		});

		const resolvedRequiredItems = new Bank();
		for (const [item, qty] of superCombat!.inputItems.items()) {
			const itemName = item.name;
			if (userWithUnf.owns(new Bank({ [itemName]: qty }))) {
				resolvedRequiredItems.add(itemName, qty);
			} else if (superCombat!.alternatives && superCombat!.alternatives[itemName]) {
				const altItemName = superCombat!.alternatives[itemName];
				if (userWithUnf.owns(new Bank({ [altItemName]: qty }))) {
					resolvedRequiredItems.add(altItemName, qty);
				} else {
					resolvedRequiredItems.add(itemName, qty);
				}
			} else {
				resolvedRequiredItems.add(itemName, qty);
			}
		}

		expect(resolvedRequiredItems.amount('Torstol')).toBe(0);
		expect(resolvedRequiredItems.amount('Torstol potion (unf)')).toBe(1);
	});

	test('Regular potions work without alternatives', () => {
		const attackPotion = Herblore.Mixables.find(m => m.aliases.includes('attack potion'));

		const user = mockMUser({
			bank: new Bank({
				'Guam potion (unf)': 100,
				'Eye of newt': 100
			}),
		});

		const resolvedRequiredItems = new Bank();
		for (const [item, qty] of attackPotion!.inputItems.items()) {
			const itemName = item.name;
			if (user.owns(new Bank({ [itemName]: qty }))) {
				resolvedRequiredItems.add(itemName, qty);
			} else if (attackPotion!.alternatives && attackPotion!.alternatives[itemName]) {
				const altItemName = attackPotion!.alternatives[itemName];
				if (user.owns(new Bank({ [altItemName]: qty }))) {
					resolvedRequiredItems.add(altItemName, qty);
				} else {
					resolvedRequiredItems.add(itemName, qty);
				}
			} else {
				resolvedRequiredItems.add(itemName, qty);
			}
		}

		expect(resolvedRequiredItems.amount('Guam potion (unf)')).toBe(1);
		expect(resolvedRequiredItems.amount('Eye of newt')).toBe(1);
	});

	test('Anti-venom+ has alternative for Torstol', () => {
		const antiVenomPlus = Herblore.Mixables.find(m => m.aliases.includes('Anti-venom+'));
		expect(antiVenomPlus).toBeDefined();
		expect(antiVenomPlus!.alternatives).toBeDefined();
		expect(antiVenomPlus!.alternatives!['Torstol']).toBe('Torstol potion (unf)');
	});
});