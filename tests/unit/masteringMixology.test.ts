import { Bank, Items } from 'oldschooljs';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { herbloreItems } from '@/lib/data/filterables.js';
import {
	calcMixologyContractBasePoints,
	calcMixologyHandInPoints,
	getMixologyContractCost,
	getMixologyContractDuration,
	masteringMixologyBuyables,
	mixologyContractDuration,
	mixologyContracts,
	mixologyHerbs
} from '@/lib/minions/data/masteringMixology.js';
import { QuestID } from '@/lib/minions/data/quests.js';
import * as tripLength from '@/lib/util/calcMaxTripLength.js';
import {
	MasteringMixologyBuyCommand,
	MasteringMixologyContractStartCommand,
	MasteringMixologyStatusCommand,
	MixologyPasteCreationCommand
} from '@/mahoji/lib/abstracted_commands/masteringMixologyCommand.js';

function mockMixologyUser(overrides: Record<string, unknown> = {}) {
	return {
		bank: new Bank(),
		user: {},
		skillLevel: () => 99,
		fetchStats: async () => ({
			mixology_mox_points: 0,
			mixology_aga_points: 0,
			mixology_lye_points: 0
		}),
		fetchMinigameScore: async () => 0,
		...overrides
	} as unknown as MUser;
}

describe('Mastering Mixology', () => {
	describe('contract scheduling', () => {
		beforeEach(() => {
			vi.spyOn(Math, 'random').mockReturnValue(0.5);
			vi.spyOn(tripLength, 'calcMaxTripLength').mockResolvedValue(mixologyContractDuration * 11.5);
			vi.stubGlobal('ActivityManager', { startTrip: vi.fn() });
			vi.stubGlobal('globalClient', { mentionCommand: () => '/minigames mastering_mixology create' });
		});

		afterEach(() => {
			vi.restoreAllMocks();
			vi.unstubAllGlobals();
		});

		function contractUser(bank: Bank, level = 99) {
			return mockMixologyUser({
				bank,
				id: '123',
				minionName: 'Test minion',
				skillLevel: () => level,
				user: { finished_quest_ids: [QuestID.ChildrenOfTheSun] }
			});
		}

		test.each([undefined, 5])('shortens a trip to one affordable contract (requested: %s)', async requested => {
			const user = contractUser(new Bank().add('Mox paste', 30));

			const result = await MasteringMixologyContractStartCommand(user, '1', requested);

			expect(ActivityManager.startTrip).toHaveBeenCalledWith(
				expect.objectContaining({
					quantity: 1,
					duration: Math.round(mixologyContractDuration),
					contractIDs: [1]
				})
			);
			expect(result).toContain('attempting 1 Mastering Mixology contract.');
			expect(user.bank.amount('Mox paste')).toEqual(30);
		});

		test('counts repeated contracts rather than affordable recipe types', async () => {
			await MasteringMixologyContractStartCommand(contractUser(new Bank().add('Mox paste', 90)), '1');

			expect(ActivityManager.startTrip).toHaveBeenCalledWith(
				expect.objectContaining({ quantity: 3, duration: Math.round(mixologyContractDuration * 3) })
			);
		});

		test('uses mixed paste recipes when there is not enough of any single paste', async () => {
			await MasteringMixologyContractStartCommand(
				contractUser(new Bank().add('Mox paste', 20).add('Aga paste', 10), 63),
				'1'
			);

			expect(ActivityManager.startTrip).toHaveBeenCalledWith(
				expect.objectContaining({ quantity: 1, contractIDs: [3] })
			);
		});

		test.each([
			new Bank(),
			new Bank().add('Mox paste', 20).add('Aga paste', 10)
		])('rejects paste that cannot fund an unlocked contract', async bank => {
			const result = await MasteringMixologyContractStartCommand(contractUser(bank, 60), '1');

			expect(result).toContain("You're out of paste!");
			expect(ActivityManager.startTrip).not.toHaveBeenCalled();
		});

		test.each([
			{ requested: undefined, expected: 10 },
			{ requested: 2, expected: 2 }
		])('respects time and requested quantity limits ($requested)', async ({ requested, expected }) => {
			await MasteringMixologyContractStartCommand(
				contractUser(new Bank().add('Mox paste', 1000)),
				'1',
				requested
			);

			expect(ActivityManager.startTrip).toHaveBeenCalledWith(
				expect.objectContaining({
					quantity: expected,
					duration: Math.round(mixologyContractDuration * expected)
				})
			);
		});
	});

	test('defines paste outputs for clean herbs and unfinished potions', () => {
		expect(mixologyHerbs).toContainEqual({ name: 'Guam leaf', paste: 'Mox', quantity: 10 });
		expect(mixologyHerbs).toContainEqual({ name: 'Guam potion (unf)', paste: 'Mox', quantity: 10 });
		expect(mixologyHerbs).toContainEqual({ name: 'Ranarr weed', paste: 'Lye', quantity: 26 });
		expect(mixologyHerbs).toContainEqual({ name: 'Irit potion (unf)', paste: 'Aga', quantity: 30 });
		expect(mixologyHerbs).toContainEqual({ name: 'Torstol potion (unf)', paste: 'Aga', quantity: 44 });
		expect(new Set(mixologyHerbs.map(herb => herb.name)).size).toEqual(mixologyHerbs.length);
	});

	test('contract paste costs match the in-game amounts', () => {
		const costOf = (name: string) =>
			getMixologyContractCost(mixologyContracts.find(c => c.name === name)!.pasteSequence);

		expect(costOf('Mammoth-Might Mix')).toEqual(new Bank().add('Mox paste', 30));
		expect(costOf('Mystic Mana Amalgam')).toEqual(new Bank().add('Mox paste', 20).add('Aga paste', 10));
		expect(costOf('MegaLite Liquid')).toEqual(new Bank().add('Mox paste', 10).add('Lye paste', 20));
		// Contracts using all three pastes cost 20 of each, not 10
		expect(costOf('MixALot')).toEqual(new Bank().add('Mox paste', 20).add('Aga paste', 20).add('Lye paste', 20));
	});

	test('contracts use three paste batches and valid requirements', () => {
		expect(mixologyContracts.length).toBeGreaterThan(0);
		expect(new Set(mixologyContracts.map(contract => contract.id)).size).toEqual(mixologyContracts.length);

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

	test('calculates base contract points using the OSRS resin table', () => {
		expect(calcMixologyContractBasePoints(['Lye', 'Lye', 'Lye'])).toEqual({ Mox: 0, Lye: 20, Aga: 0 });
		expect(calcMixologyContractBasePoints(['Mox', 'Mox', 'Aga'])).toEqual({ Mox: 20, Lye: 0, Aga: 10 });
		expect(calcMixologyContractBasePoints(['Mox', 'Aga', 'Lye'])).toEqual({ Mox: 20, Lye: 20, Aga: 20 });
	});

	test('applies multi-order hand-in bonus to batches', () => {
		const twoOrderBatch = calcMixologyHandInPoints([
			{ Mox: 20, Lye: 0, Aga: 10 },
			{ Mox: 0, Lye: 20, Aga: 0 }
		]);
		const threeOrderBatch = calcMixologyHandInPoints([
			{ Mox: 20, Lye: 0, Aga: 0 },
			{ Mox: 0, Lye: 30, Aga: 0 },
			{ Mox: 0, Lye: 0, Aga: 20 }
		]);

		expect(twoOrderBatch).toEqual({ Mox: 24, Lye: 24, Aga: 12 });
		expect(threeOrderBatch).toEqual({ Mox: 28, Lye: 42, Aga: 28 });
	});

	test('paste creation rejects busy minions before removing herbs', async () => {
		const removeItemsFromBank = vi.fn();
		const user = mockMixologyUser({
			bank: new Bank().add('Guam leaf'),
			minionName: 'Test minion',
			minionIsBusy: async () => true,
			removeItemsFromBank,
			user: {
				finished_quest_ids: [QuestID.ChildrenOfTheSun]
			}
		});

		await expect(MixologyPasteCreationCommand(user, '1', 'Guam leaf', 1)).resolves.toEqual('Test minion is busy.');
		expect(removeItemsFromBank).not.toHaveBeenCalled();
	});

	test('status reports points, paste and completed contracts', async () => {
		const user = mockMixologyUser({
			bank: new Bank().add('Mox paste', 10).add('Aga paste', 20).add('Lye paste', 30),
			fetchStats: async () => ({
				mixology_mox_points: 100,
				mixology_aga_points: 200,
				mixology_lye_points: 300
			}),
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
