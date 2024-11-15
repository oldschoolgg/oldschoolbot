import { Bank } from 'oldschooljs/dist/meta/types';
import { describe, expect, it } from 'vitest';

import { filterLootReplace } from '../../src/lib/slayer/slayerUtil';

describe('filterLootReplace', () => {
	it('Should replace blugeon pieces when owning none', () => {
		const bank = new Bank().add('Twisted bow');
		const itemsToAdd = new Bank().add('Bludgeon claw', 4);
		filterLootReplace(bank, itemsToAdd);
		expect(itemsToAdd.amount('Bludgeon claw')).toBe(2);
		expect(itemsToAdd.amount('Bludgeon spine')).toBe(1);
		expect(itemsToAdd.amount('Bludgeon axon')).toBe(1);
	});

	it('Should replace blugeon pieces', () => {
		const bank = new Bank().add('Twisted bow').add('Bludgeon spine');
		const itemsToAdd = new Bank().add('Bludgeon claw', 2);
		filterLootReplace(bank, itemsToAdd);
		expect(itemsToAdd.amount('Bludgeon claw')).toBe(1);
		expect(itemsToAdd.amount('Bludgeon spine')).toBe(0);
		expect(itemsToAdd.amount('Bludgeon axon')).toBe(1);
	});

	it('Should replace hydra pieces when owning none', () => {
		const bank = new Bank().add('Twisted bow');
		const itemsToAdd = new Bank().add("Hydra's eye", 2).add("Hydra's fang");
		filterLootReplace(bank, itemsToAdd);
		expect(itemsToAdd.amount("Hydra's eye")).toBe(1);
		expect(itemsToAdd.amount("Hydra's fang")).toBe(1);
		expect(itemsToAdd.amount("Hydra's heart")).toBe(1);
	});

	it('Should replace hydra pieces', () => {
		const bank = new Bank().add('Twisted bow').add("Hydra's fang");
		const itemsToAdd = new Bank().add("Hydra's eye").add("Hydra's fang");
		filterLootReplace(bank, itemsToAdd);
		expect(itemsToAdd.amount("Hydra's eye")).toBe(1);
		expect(itemsToAdd.amount("Hydra's fang")).toBe(0);
		expect(itemsToAdd.amount("Hydra's heart")).toBe(1);
	});
});
