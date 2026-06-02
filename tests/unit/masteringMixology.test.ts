import { Bank, Items } from 'oldschooljs';
import { describe, expect, test, vi } from 'vitest';

import { herbloreItems } from '@/lib/data/filterables.js';
import {
	getMixologyContractDuration,
	MasteringMixologyBuyCommand,
	MasteringMixologyStatusCommand,
	masteringMixologyBuyables,
	mixologyContracts,
	mixologyHerbs
} from '@/mahoji/lib/abstracted_commands/masteringMixologyCommand.js';

function mockMixologyUser(overrides: Record<string, unknown> = {}) {
	return {
		bank: new Bank(),
		user: {
			mixology_mox_points: 0,
			mixology_aga_points: 0,
			mixology_lye_points: 0
		},
		skillLevel: () => 99,
		fetchMinigameScore: async () => 0,
		...overrides
	} as unknown as MUser;
}

describe('Mastering Mixology', () => {
	test('defines paste outputs for clean herbs and unfinished potions', () => {
		expect(mixologyHerbs).toContainEqual({ name: 'Guam leaf', paste: 'Mox', quantity: 10 });
		expect(mixologyHerbs).toContainEqual({ name: 'Guam potion (unf)', paste: 'Mox', quantity: 10 });
		expect(mixologyHerbs).toContainEqual({ name: 'Ranarr weed', paste: 'Lye', quantity: 26 });
		expect(mixologyHerbs).toContainEqual({ name: 'Irit potion (unf)', paste: 'Aga', quantity: 30 });
		expect(mixologyHerbs).toContainEqual({ name: 'Torstol potion (unf)', paste: 'Aga', quantity: 44 });
		expect(new Set(mixologyHerbs.map(herb => herb.name)).size).toEqual(mixologyHerbs.length);
	});

	test('contracts use three paste batches and valid requirements', () => {
		expect(mixologyContracts.length).toBeGreaterThan(0);

		for (const contract of mixologyContracts) {
			expect(contract.pasteSequence).toHaveLength(3);
			expect(contract.requiredLevel).toBeGreaterThanOrEqual(60);
			expect(contract.xp).toBeGreaterThan(0);
			expect(contract.weight).toBeGreaterThan(0);
			expect(contract.pasteSequence.every(paste => ['Mox', 'Lye', 'Aga'].includes(paste))).toBe(true);
		}
	});

	test('buyables resolve to real items and have positive costs', () => {
		expect(masteringMixologyBuyables.length).toBeGreaterThan(0);

		for (const buyable of masteringMixologyBuyables) {
			expect(Items.getOrThrow(buyable.item.id)).toEqual(buyable.item);
			expect(buyable.cost.Mox).toBeGreaterThan(0);
			expect(buyable.cost.Aga).toBeGreaterThan(0);
			expect(buyable.cost.Lye).toBeGreaterThan(0);
		}
	});

	test('herblore preset includes mixology paste', () => {
		expect(herbloreItems).toContain(Items.getOrThrow('Mox paste').id);
		expect(herbloreItems).toContain(Items.getOrThrow('Aga paste').id);
		expect(herbloreItems).toContain(Items.getOrThrow('Lye paste').id);
	});

	test('contract duration stays within ten percent variance', () => {
		const base = 1000;

		vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.5).mockReturnValueOnce(1);

		expect(getMixologyContractDuration(base)).toEqual(900);
		expect(getMixologyContractDuration(base)).toEqual(1000);
		expect(getMixologyContractDuration(base)).toEqual(1100);
	});

	test('status reports points, paste and completed contracts', async () => {
		const user = mockMixologyUser({
			bank: new Bank().add('Mox paste', 10).add('Aga paste', 20).add('Lye paste', 30),
			user: {
				mixology_mox_points: 100,
				mixology_aga_points: 200,
				mixology_lye_points: 300
			},
			fetchMinigameScore: async (minigame: string) => {
				expect(minigame).toEqual('mastering_mixology');
				return 12;
			}
		});

		await expect(
			MasteringMixologyStatusCommand(user)
		).resolves.toEqual(`You have 100 Mox points, 200 Aga points and 300 Lye points.
You have 10x Mox paste, 20x Aga paste and 30x Lye paste.
You have completed 12 Mastering Mixology contracts.`);
	});

	test('shop rejects purchases without enough mixology points', async () => {
		const result = await MasteringMixologyBuyCommand(mockMixologyUser(), 'Aldarium', 2);

		expect(result).toEqual(
			"You don't have enough Mixology points to buy 2x Aldarium. You need 160 Mox, 120 Aga and 180 Lye points."
		);
	});
});
