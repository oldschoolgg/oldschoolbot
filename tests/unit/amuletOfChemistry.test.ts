import { Bank, EItem } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { mixCommand } from '@/mahoji/commands/mix.js';
import { mockClient } from '../util.js';

describe('Amulet of Chemistry', async () => {
	const client = await mockClient();

	async function makeChemUser() {
		const user = await client.mockUser({
			levels: { herblore: 38 }
		});
		await user.addItemsToBank({
			items: new Bank().add(EItem.SNAPE_GRASS, 10_000).add(EItem.RANARR_POTION_UNF, 10_000)
		});
		await user.giveCharges('chemistry_amulet_charges', 1000);
		await user.equip('skilling', [EItem.AMULET_OF_CHEMISTRY]);
		return user;
	}

	it("shouldn't use AOC without charges", async () => {
		const user = await makeChemUser();
		await user.update({ chemistry_amulet_charges: 0 });
		await user.runCmdAndTrip(mixCommand, { name: 'Prayer potion', quantity: 500 });
		expect(user.bank.amount(EItem.SNAPE_GRASS)).toBe(9_500);
		expect(user.bank.amount(EItem.RANARR_POTION_UNF)).toBe(9_500);
		expect(user.bank.amount(EItem.PRAYER_POTION3)).toBe(500);
	});

	it('should use AOC with charges', async () => {
		const user = await makeChemUser();
		await user.runCmdAndTrip(mixCommand, { name: 'Prayer potion', quantity: 500 });
		expect(user.bank.amount(EItem.SNAPE_GRASS)).toBe(9_500);
		expect(user.bank.amount(EItem.RANARR_POTION_UNF)).toBe(9_500);
		const full = user.bank.amount(EItem.PRAYER_POTION4);
		const partial = user.bank.amount(EItem.PRAYER_POTION3);
		expect(full + partial).toBe(500);
		expect(user.user.chemistry_amulet_charges).toBe(1000 - full);
	});

	it('should only use available AOC charges', async () => {
		const user = await makeChemUser();
		await user.update({ chemistry_amulet_charges: 1 });
		await user.runCmdAndTrip(mixCommand, { name: 'Prayer potion', quantity: 500 });
		expect(user.bank.amount(EItem.SNAPE_GRASS)).toBe(9_500);
		expect(user.bank.amount(EItem.RANARR_POTION_UNF)).toBe(9_500);
		expect(user.bank.amount(EItem.PRAYER_POTION3)).toBe(499);
		expect(user.bank.amount(EItem.PRAYER_POTION4)).toBe(1);
		expect(user.user.chemistry_amulet_charges).toBe(0);
	});
});
