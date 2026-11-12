import type { RNGProvider } from 'node-rng';
import { Bank, Items } from 'oldschooljs';
import { afterEach, describe, expect, test, vi } from 'vitest';

import * as degradeableItemsModule from '@/lib/degradeableItems.js';
import { degradeableItemsCommand } from '@/lib/minions/functions/degradeableItemsCommand.js';
import Herblore from '@/lib/skilling/skills/herblore/herblore.js';
import type { HerbloreActivityTaskOptions } from '@/lib/types/minions.js';
import { MasteringMixologyBuyCommand } from '@/mahoji/lib/abstracted_commands/masteringMixologyCommand.js';
import { herbloreTask } from '@/tasks/minions/herbloreActivity.js';
import { mockMUser } from './userutil.js';

const amulet = Items.getOrThrow("Alchemist's amulet");

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

function getMixable(name: string) {
	const id = Items.getOrThrow(name).id;
	return Herblore.Mixables.find(mixable => mixable.item.id === id)!;
}

async function brew(name: string, charges: number, results: boolean[], goggles = false) {
	const user = mockMUser({ id: '123' });
	user.gear.skilling.equip(amulet);
	if (goggles) user.gear.skilling.equip('Prescription goggles');
	user.addXP = vi.fn().mockResolvedValue('xp result');
	const transactSpy = vi.spyOn(user, 'transactItems').mockResolvedValue({
		previousCL: new Bank(),
		itemsAdded: new Bank(),
		itemsRemoved: undefined,
		newBank: new Bank(),
		newCL: new Bank(),
		newUser: user,
		clLootBank: null
	});
	const checkSpy = vi.spyOn(degradeableItemsModule, 'checkDegradeableItemCharges').mockResolvedValue(charges);
	const degradeSpy = vi
		.spyOn(degradeableItemsModule, 'degradeItem')
		.mockImplementation(async ({ chargesToDegrade }) => ({
			chargesToDegrade,
			chargesRemaining: charges - chargesToDegrade,
			userMessage: 'Charges consumed.'
		}));
	const quantity = 3;
	const percentChance = vi.fn(() => results.shift() ?? false);
	const handleTripFinish = vi.fn();
	const mixable = getMixable(name);
	await herbloreTask.run(
		{
			id: 1,
			type: 'Herblore',
			mixableID: mixable.item.id,
			quantity,
			zahur: false,
			wesley: false,
			userID: user.id,
			channelId: '456',
			duration: 1,
			finishDate: Date.now()
		} satisfies HerbloreActivityTaskOptions,
		{ user, handleTripFinish, rng: { percentChance } as unknown as RNGProvider }
	);
	return {
		user,
		loot: transactSpy.mock.calls[0][0].itemsToAdd!,
		checkSpy,
		degradeSpy,
		percentChance,
		handleTripFinish
	};
}

describe("Alchemist's amulet brewing", () => {
	test('rolls 15% per potion and consumes a charge only when creating an extra dose', async () => {
		const { user, loot, degradeSpy, percentChance } = await brew('Attack potion(3)', 50, [true, false, true]);
		expect(percentChance.mock.calls).toEqual([[15], [15], [15]]);
		expect(loot.amount('Attack potion(3)')).toBe(1);
		expect(loot.amount('Attack potion(4)')).toBe(2);
		expect(degradeSpy).toHaveBeenCalledWith({ item: amulet, chargesToDegrade: 2, user });
		expect(user.addXP).toHaveBeenCalledWith({ skillName: 'herblore', amount: 75, duration: 1 });
	});

	test('does not consume charges when no bonus dose is made', async () => {
		const { loot, degradeSpy } = await brew('Attack potion(3)', 50, [false, false, false]);
		expect(loot.amount('Attack potion(3)')).toBe(3);
		expect(loot.amount('Attack potion(4)')).toBe(0);
		expect(degradeSpy).not.toHaveBeenCalled();
	});

	test.each([0, 1])('limits upgrades to %i available charges', async charges => {
		const { loot, percentChance, degradeSpy } = await brew('Attack potion(3)', charges, [true, true, true]);
		expect(loot.amount('Attack potion(4)')).toBe(charges);
		expect(loot.amount('Attack potion(3)')).toBe(3 - charges);
		expect(percentChance).toHaveBeenCalledTimes(charges);
		expect(degradeSpy).toHaveBeenCalledTimes(charges > 0 ? 1 : 0);
	});

	test.each(['Stamina potion', 'Anti-venom'])('adds exactly one dose to lower-dose %s', async name => {
		for (const doses of [1, 2, 3]) {
			const { user, loot } = await brew(`${name}(${doses})`, 50, [true, false, false]);
			expect(loot.amount(`${name}(${doses})`)).toBe(2);
			expect(loot.amount(`${name}(${doses + 1})`)).toBe(1);
			expect(user.addXP).toHaveBeenCalledWith({
				skillName: 'herblore',
				amount: getMixable(`${name}(${doses})`).xp * 3,
				duration: 1
			});
			vi.restoreAllMocks();
		}
	});

	test.each([
		'Guthix rest(3)',
		'Stamina potion(4)',
		'Anti-venom(4)',
		'Antidote+(4)',
		'Antidote++(4)',
		'Anti-venom+(4)',
		'Super combat potion(4)',
		'Super antifire potion(4)'
	])('does not apply to %s', async name => {
		const { loot, checkSpy, degradeSpy, percentChance } = await brew(name, 50, [true, true, true]);
		expect(loot.amount(name)).toBe(3);
		expect(checkSpy).not.toHaveBeenCalled();
		expect(degradeSpy).not.toHaveBeenCalled();
		expect(percentChance).not.toHaveBeenCalled();
	});

	test('works alongside prescription goggles', async () => {
		const { loot, percentChance } = await brew(
			'Attack potion(3)',
			50,
			[true, false, false, true, false, false],
			true
		);
		expect(percentChance.mock.calls).toEqual([[15], [15], [15], [10], [10], [10]]);
		expect(loot.amount('Attack potion(4)')).toBe(1);
		expect(loot.amount('Attack potion(3)')).toBe(2);
		expect(loot.amount('Eye of newt')).toBe(1);
	});

	test('lower-dose recipes scale ingredient costs and XP', () => {
		const stamina = getMixable('Stamina potion(1)');
		expect(stamina.inputItems).toEqual(new Bank().add('Super energy(1)').add('Amylase crystal'));
		expect(stamina.xp).toBe(25.5);
		const antiVenom = getMixable('Anti-venom(2)');
		expect(antiVenom.inputItems).toEqual(new Bank().add('Antidote++(2)').add("Zulrah's scales", 10));
		expect(antiVenom.xp).toBe(60);
	});
});

function chargingUser(charges: number, ownsAmulet = true, chemistryCharges = 0) {
	const state = { alchemist_amulet_charges: charges, chemistry_amulet_charges: chemistryCharges };
	return {
		user: state,
		cl: new Bank(),
		hasEquippedOrInBank: vi.fn(() => ownsAmulet),
		hasEquipped: vi.fn(() => true),
		owns: vi.fn(() => true),
		transactItems: vi.fn(async ({ otherUpdates }: Parameters<MUser['transactItems']>[0]) => {
			for (const key of ['alchemist_amulet_charges', 'chemistry_amulet_charges'] as const) {
				const change = otherUpdates?.[key];
				if (typeof change === 'number') state[key] = change;
				else if (change && 'increment' in change) state[key] += change.increment;
				else if (change && 'decrement' in change) state[key] -= change.decrement;
			}
		}),
		update: vi.fn(async ({ alchemist_amulet_charges }: { alchemist_amulet_charges: number }) => {
			state.alchemist_amulet_charges = alchemist_amulet_charges;
		})
	};
}

describe("Alchemist's amulet charges", () => {
	test('retains the amulet when the last charge is consumed, even with a lucky penny', async () => {
		const user = chargingUser(1);
		const result = await degradeableItemsModule.degradeItem({
			item: amulet,
			chargesToDegrade: 1,
			user: user as unknown as MUser
		});
		expect(user.user.alchemist_amulet_charges).toBe(0);
		expect(user.transactItems).not.toHaveBeenCalled();
		expect(user.hasEquipped).not.toHaveBeenCalled();
		expect(result.chargesToDegrade).toBe(1);
		expect(result.chargesRemaining).toBe(0);
		expect(result.userMessage).not.toContain('broke');
	});

	test.each([0, 5000, 25_000])('adds charges from chemistry amulets with %i existing charges', async charges => {
		const user = chargingUser(charges);
		const interaction = { confirmation: vi.fn() } as unknown as MInteraction;
		vi.stubGlobal('ClientSettings', { updateBankSetting: vi.fn() });
		await degradeableItemsCommand(interaction, user as unknown as MUser, amulet.name, 1000, undefined);
		expect(user.user.alchemist_amulet_charges).toBe(charges + 10_000);
		expect(user.transactItems).toHaveBeenCalledWith({
			itemsToRemove: new Bank().add('Amulet of chemistry', 1000),
			otherUpdates: { alchemist_amulet_charges: { increment: 10_000 } }
		});
	});

	test.each([
		{ chemistry: 100, amount: 100, alchemist: 50 },
		{ chemistry: 7, amount: 3, alchemist: 4990 },
		{ chemistry: 3, amount: 1, alchemist: 4998 },
		{ chemistry: 10_000, amount: 10_000, alchemist: 5000 },
		{ chemistry: 10_000, amount: 5000, alchemist: 25_000 }
	])('transfers $amount stored chemistry charges at double value', async ({ chemistry, amount, alchemist }) => {
		const user = chargingUser(alchemist, true, chemistry);
		await degradeableItemsCommand(
			{ confirmation: vi.fn() } as unknown as MInteraction,
			user as unknown as MUser,
			amulet.name,
			amount,
			'chemistry charges'
		);
		expect(user.user.alchemist_amulet_charges).toBe(alchemist + amount * 2);
		expect(user.user.chemistry_amulet_charges).toBe(chemistry - amount);
		expect(user.transactItems).toHaveBeenCalledWith({
			otherUpdates: {
				chemistry_amulet_charges: { decrement: amount },
				alchemist_amulet_charges: { increment: amount * 2 }
			}
		});
	});

	test.each([
		{ chemistry: 0, amount: 1, alchemist: 0, owns: true },
		{ chemistry: 3, amount: 4, alchemist: 0, owns: true },
		{ chemistry: 5, amount: 1, alchemist: 0, owns: false }
	])('rejects invalid charge transfers without consuming charges ($chemistry, $alchemist, $owns)', async ({
		chemistry,
		amount,
		alchemist,
		owns
	}) => {
		const user = chargingUser(alchemist, owns, chemistry);
		const confirmation = vi.fn();
		await degradeableItemsCommand(
			{ confirmation } as unknown as MInteraction,
			user as unknown as MUser,
			amulet.name,
			amount,
			'chemistry charges'
		);
		expect(confirmation).not.toHaveBeenCalled();
		expect(user.transactItems).not.toHaveBeenCalled();
		expect(user.user.chemistry_amulet_charges).toBe(chemistry);
		expect(user.user.alchemist_amulet_charges).toBe(alchemist);
	});

	test('transferred chemistry charges cannot be used a second time', async () => {
		const user = chargingUser(0, true, 5);
		const interaction = { confirmation: vi.fn() } as unknown as MInteraction;
		for (let i = 0; i < 2; i++) {
			await degradeableItemsCommand(interaction, user as unknown as MUser, amulet.name, 5, 'chemistry charges');
		}
		expect(user.transactItems).toHaveBeenCalledTimes(1);
		expect(user.user.alchemist_amulet_charges).toBe(10);
		expect(user.user.chemistry_amulet_charges).toBe(0);
	});

	test('rejects charging without an alchemist amulet', async () => {
		const user = chargingUser(0, false);
		const confirmation = vi.fn();
		await degradeableItemsCommand(
			{ confirmation } as unknown as MInteraction,
			user as unknown as MUser,
			amulet.name,
			1,
			undefined
		);
		expect(confirmation).not.toHaveBeenCalled();
		expect(user.transactItems).not.toHaveBeenCalled();
	});

	test.each([0, 1, 9, 10, 59, 25_009])('uncharges %i charges, rounding the refund down', async charges => {
		const user = chargingUser(charges);
		await degradeableItemsCommand(
			{ confirmation: vi.fn() } as unknown as MInteraction,
			user as unknown as MUser,
			amulet.name,
			undefined,
			undefined,
			true
		);
		expect(user.user.alchemist_amulet_charges).toBe(0);
		if (charges > 0) {
			expect(user.transactItems).toHaveBeenCalledWith({
				itemsToAdd: new Bank().add('Amulet of chemistry', Math.floor(charges / 10)),
				collectionLog: false,
				otherUpdates: { alchemist_amulet_charges: 0 }
			});
			expect(user.transactItems.mock.calls[0][0].itemsToAdd!.validate()).toEqual([]);
		} else {
			expect(user.transactItems).not.toHaveBeenCalled();
		}
	});

	test.each([0, 25_000])('shop grants 50 starting charges with %i existing charges', async charges => {
		const user = {
			...chargingUser(charges),
			skillLevel: () => 99,
			fetchStats: async () => ({
				mixology_mox_points: 6900,
				mixology_aga_points: 5650,
				mixology_lye_points: 7400
			}),
			statsUpdate: vi.fn()
		};
		await MasteringMixologyBuyCommand(user as unknown as MUser, amulet.name);
		expect(user.transactItems).toHaveBeenCalledWith({
			itemsToAdd: new Bank().add(amulet.id),
			collectionLog: true,
			otherUpdates: { alchemist_amulet_charges: { increment: 50 } }
		});
		expect(user.statsUpdate).toHaveBeenCalledWith({
			mixology_mox_points: { decrement: 6900 },
			mixology_aga_points: { decrement: 5650 },
			mixology_lye_points: { decrement: 7400 }
		});
	});

	test.each([0, 50, 25_000])('repeat shop purchases do not recharge the existing %i charges', async charges => {
		const user = {
			...chargingUser(charges),
			cl: new Bank().add(amulet.id),
			skillLevel: () => 99,
			fetchStats: async () => ({
				mixology_mox_points: 6900,
				mixology_aga_points: 5650,
				mixology_lye_points: 7400
			}),
			statsUpdate: vi.fn()
		};
		await MasteringMixologyBuyCommand(user as unknown as MUser, amulet.name);
		expect(user.transactItems).toHaveBeenCalledWith({
			itemsToAdd: new Bank().add(amulet.id),
			collectionLog: true,
			otherUpdates: undefined
		});
		expect(user.user.alchemist_amulet_charges).toBe(charges);
	});
});
