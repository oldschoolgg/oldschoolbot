import { describe, expect, it } from 'vitest';

import { Bank } from '../src';
import LootTable from '../src/structures/LootTable';

describe('LootTable', async () => {
	it('should clone', () => {
		const table1 = new LootTable().every('Coal').tertiary(1, 'Coal').add('Coal');
		const table2 = table1.clone();

		table1.add('Coal').add('Coal').tertiary(1, 'Coal').every('Bones');

		expect(table2.length).toEqual(1);
		expect(table2.tertiaryItems.length).toEqual(1);
	});

	it('should roll tertiary items', () => {
		const table = new LootTable().tertiary(1, 'Coal');
		for (const qty of [1, 2, 5]) {
			const loot = table.roll(qty);
			expect(loot.amount('Coal')).toEqual(qty);

			const loot2 = new Bank();
			table.roll(qty, { targetBank: loot2 });
			expect(loot2.amount('Coal')).toEqual(qty);
		}
	});

	it('should roll weight items', () => {
		const table = new LootTable().add('Coal', 1);
		for (const qty of [1, 2, 5]) {
			const loot = table.roll(qty);
			expect(loot.amount('Coal')).toEqual(qty);

			const loot2 = new Bank();
			table.roll(qty, { targetBank: loot2 });
			expect(loot2.amount('Coal')).toEqual(qty);
		}
	});

	it('should return null if loot passed', () => {
		const loot = new Bank();
		const table = new LootTable().add('Coal', 1);
		const res = table.roll(1, { targetBank: loot });
		expect(res).toBeNull();
	});

	it('should return loot if no target passed', () => {
		const table = new LootTable().add('Coal', 1);
		const res = table.roll(1);
		expect(res).toBeInstanceOf(Bank);
		expect(res.amount('Coal')).toEqual(1);
		expect(res.length).toEqual(1);
	});
});
