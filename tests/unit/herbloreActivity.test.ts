import type { RNGProvider } from 'node-rng';
import { Bank, Items } from 'oldschooljs';
import type { Mock } from 'vitest';
import { afterEach, describe, expect, test, vi } from 'vitest';

import * as degradeableItemsModule from '../../src/lib/degradeableItems.js';
import type { HerbloreActivityTaskOptions } from '../../src/lib/types/minions.js';
import * as handleTripFinishModule from '../../src/lib/util/handleTripFinish.js';
import { herbloreTask } from '../../src/tasks/minions/herbloreActivity.js';
import { mockMUser } from './userutil.js';

const chemistryItem = Items.getOrThrow('Amulet of chemistry');
const attackPotion3 = Items.getOrThrow('Attack potion (3)');
const attackPotion4 = Items.getOrThrow('Attack potion (4)');
const guthixRest3 = Items.getOrThrow('Guthix rest(3)');
const guthixRest4 = Items.getOrThrow('Guthix rest(4)');

const globalAny = globalThis as unknown as {
	mUserFetch?: (...args: any[]) => Promise<any>;
};

const originalMUserFetch = globalAny.mUserFetch;

function defaultTaskData(overrides: Partial<HerbloreActivityTaskOptions> = {}): HerbloreActivityTaskOptions {
	return {
		id: 1,
		type: 'Herblore',
		mixableID: attackPotion3.id,
		quantity: 3,
		zahur: false,
		wesley: false,
		userID: '123',
		channelId: '456',
		duration: 1,
		finishDate: Date.now() + 1,
		...overrides
	};
}

describe('herbloreTask amulet of chemistry behaviour', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		globalAny.mUserFetch = originalMUserFetch;
	});

	test('produces four-dose potions and consumes charges when the amulet procs', async () => {
		const user = mockMUser({ id: '123' });
		user.gear.skilling.equip(chemistryItem);
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

		// RNG: first two procs succeed, third fails -> 2x (4), 1x (3)
		const percentResults = [true, true, false];
		const percentSpy = vi.fn(() => percentResults.shift() ?? false);
		const rng = {
			percentChance: percentSpy,
			randInt: vi.fn()
		} as unknown as RNGProvider;

		const checkSpy = vi.spyOn(degradeableItemsModule, 'checkDegradeableItemCharges').mockResolvedValue(5);
		const degradeSpy = vi.spyOn(degradeableItemsModule, 'degradeItem').mockResolvedValue({
			userMessage: 'Your Amulet of chemistry degraded by 2 charges.',
			chargesToDegrade: 2,
			chargesRemaining: 3
		});

		// Prevent side effects from trip finish (discord sends etc.)
		const handleTripFinishSpy = vi
			.spyOn(handleTripFinishModule, 'handleTripFinish')
			.mockImplementation(async () => {});

		globalAny.mUserFetch = vi.fn().mockResolvedValue(user);
		const taskData = defaultTaskData();

		await herbloreTask.run(taskData, {
			user,
			handleTripFinish: handleTripFinishModule.handleTripFinish,
			rng
		} as never);

		// RNG/charge plumbing
		expect(percentSpy).toHaveBeenCalledTimes(3);
		expect(percentSpy).toHaveBeenCalledWith(5);
		expect(checkSpy).toHaveBeenCalledWith({ item: chemistryItem, user });
		expect(degradeSpy).toHaveBeenCalledWith({ item: chemistryItem, chargesToDegrade: 2, user });

		// Loot: 2x (4), 1x (3)
		const transactCall = (transactSpy as unknown as Mock).mock.calls[0][0];
		expect(transactCall).toMatchObject({ collectionLog: true });
		expect(transactCall.itemsToAdd).toBeInstanceOf(Bank);
		expect(transactCall.itemsToAdd.amount(attackPotion4.id)).toBe(2);
		expect(transactCall.itemsToAdd.amount(attackPotion3.id)).toBe(1);

		expect(handleTripFinishSpy).toHaveBeenCalledWith({
			user,
			channelId: '456',
			message: `${user}, ${user.minionName} finished making 1x ${attackPotion3.name} and 2x ${attackPotion4.name}.\nYour Amulet of chemistry created 2 extra 4-dose potions and used 2 charges (3 left).\nxp result`,
			data: taskData,
			loot: transactCall.itemsToAdd
		});
	});

	test('skips amulet logic when it is not equipped', async () => {
		const user = mockMUser({ id: '789' });
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

		const percentSpy = vi.fn(() => true);
		const rng = {
			percentChance: percentSpy,
			randInt: vi.fn()
		} as unknown as RNGProvider;
		const checkSpy = vi.spyOn(degradeableItemsModule, 'checkDegradeableItemCharges').mockResolvedValue(5);
		const degradeSpy = vi.spyOn(degradeableItemsModule, 'degradeItem');

		// Prevent side effects from trip finish (discord sends etc.)
		vi.spyOn(handleTripFinishModule, 'handleTripFinish').mockImplementation(async () => {});

		globalAny.mUserFetch = vi.fn().mockResolvedValue(user);

		await herbloreTask.run(defaultTaskData({ userID: '789' }), {
			user,
			handleTripFinish: handleTripFinishModule.handleTripFinish,
			rng
		} as never);

		// No amulet => no RNG or charge checks
		expect(percentSpy).not.toHaveBeenCalled();
		expect(checkSpy).not.toHaveBeenCalled();
		expect(degradeSpy).not.toHaveBeenCalled();

		// All items remain (3-dose)
		const transactCall = (transactSpy as unknown as Mock).mock.calls[0][0];
		expect(transactCall.itemsToAdd.amount(attackPotion4.id)).toBe(0);
		expect(transactCall.itemsToAdd.amount(attackPotion3.id)).toBe(3);
	});

	test('does not consume charges when no four-dose potions are created', async () => {
		const user = mockMUser({ id: '456' });
		user.gear.skilling.equip(chemistryItem);
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

		// RNG never procs -> 0x (4), 3x (3)
		const percentSpy = vi.fn(() => false);
		const rng = {
			percentChance: percentSpy,
			randInt: vi.fn()
		} as unknown as RNGProvider;
		const checkSpy = vi.spyOn(degradeableItemsModule, 'checkDegradeableItemCharges').mockResolvedValue(5);
		const degradeSpy = vi.spyOn(degradeableItemsModule, 'degradeItem');

		// Prevent side effects from trip finish (discord sends etc.)
		vi.spyOn(handleTripFinishModule, 'handleTripFinish').mockImplementation(async () => {});

		globalAny.mUserFetch = vi.fn().mockResolvedValue(user);

		await herbloreTask.run(defaultTaskData(), {
			user,
			handleTripFinish: handleTripFinishModule.handleTripFinish,
			rng
		} as never);

		// RNG called, but no degrade call since no successes
		expect(percentSpy).toHaveBeenCalledTimes(3);
		expect(checkSpy).toHaveBeenCalledWith({ item: chemistryItem, user });
		expect(degradeSpy).not.toHaveBeenCalled();

		// Loot: all (3-dose)
		const transactCall = (transactSpy as unknown as Mock).mock.calls[0][0];
		expect(transactCall.itemsToAdd.amount(attackPotion4.id)).toBe(0);
		expect(transactCall.itemsToAdd.amount(attackPotion3.id)).toBe(3);
	});

	test('does not apply amulet of chemistry to Guthix rest', async () => {
		const user = mockMUser({ id: '321' });
		user.gear.skilling.equip(chemistryItem);
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

		const percentSpy = vi.fn(() => true);
		const rng = {
			percentChance: percentSpy,
			randInt: vi.fn()
		} as unknown as RNGProvider;
		const checkSpy = vi.spyOn(degradeableItemsModule, 'checkDegradeableItemCharges').mockResolvedValue(5);
		const degradeSpy = vi.spyOn(degradeableItemsModule, 'degradeItem');

		vi.spyOn(handleTripFinishModule, 'handleTripFinish').mockImplementation(async () => {});

		globalAny.mUserFetch = vi.fn().mockResolvedValue(user);

		await herbloreTask.run(defaultTaskData({ mixableID: guthixRest3.id }), {
			user,
			handleTripFinish: handleTripFinishModule.handleTripFinish,
			rng
		} as never);

		expect(percentSpy).not.toHaveBeenCalled();
		expect(checkSpy).not.toHaveBeenCalled();
		expect(degradeSpy).not.toHaveBeenCalled();

		const transactCall = (transactSpy as unknown as Mock).mock.calls[0][0];
		expect(transactCall.itemsToAdd.amount(guthixRest4.id)).toBe(0);
		expect(transactCall.itemsToAdd.amount(guthixRest3.id)).toBe(3);
	});

	test.each([0, 1])('limits four-dose potions to the available %i charges', async charges => {
		const user = mockMUser({ id: '123' });
		user.gear.skilling.equip(chemistryItem);
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
		vi.spyOn(degradeableItemsModule, 'checkDegradeableItemCharges').mockResolvedValue(charges);
		const degradeSpy = vi.spyOn(degradeableItemsModule, 'degradeItem').mockResolvedValue({
			userMessage: 'Your Amulet of chemistry ran out of charges and broke.'
		});
		const percentChance = vi.fn(() => true);
		const handleTripFinish = vi.fn();

		await herbloreTask.run(defaultTaskData(), {
			user,
			handleTripFinish,
			rng: { percentChance } as unknown as RNGProvider
		});

		expect(percentChance).toHaveBeenCalledTimes(charges);
		if (charges > 0) {
			expect(degradeSpy).toHaveBeenCalledTimes(1);
			expect(degradeSpy).toHaveBeenCalledWith({ item: chemistryItem, chargesToDegrade: charges, user });
			expect(handleTripFinish).toHaveBeenCalledWith(
				expect.objectContaining({ message: expect.stringContaining('ran out of charges and broke.') })
			);
		} else {
			expect(degradeSpy).not.toHaveBeenCalled();
		}
		const loot = transactSpy.mock.calls[0][0].itemsToAdd!;
		expect(loot.amount(attackPotion4.id)).toBe(charges);
		expect(loot.amount(attackPotion3.id)).toBe(3 - charges);
	});

	test('preserves prescription goggles savings alongside chemistry potion upgrades', async () => {
		const user = mockMUser({ id: '123' });
		user.gear.skilling.equip(chemistryItem);
		user.gear.skilling.equip(Items.getOrThrow('Prescription goggles'));
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
		vi.spyOn(degradeableItemsModule, 'checkDegradeableItemCharges').mockResolvedValue(5);
		const degradeSpy = vi.spyOn(degradeableItemsModule, 'degradeItem').mockResolvedValue({
			userMessage: 'Your Amulet of chemistry degraded by 1 charge.',
			chargesToDegrade: 1,
			chargesRemaining: 4
		});
		const percentChance = vi.fn(() => true);
		const handleTripFinish = vi.fn();

		await herbloreTask.run(defaultTaskData({ quantity: 1 }), {
			user,
			handleTripFinish,
			rng: { percentChance } as unknown as RNGProvider
		});

		expect(percentChance).toHaveBeenNthCalledWith(1, 5);
		expect(percentChance).toHaveBeenNthCalledWith(2, 10);
		expect(percentChance).toHaveBeenCalledTimes(2);
		expect(degradeSpy).toHaveBeenCalledWith({ item: chemistryItem, chargesToDegrade: 1, user });
		const loot = transactSpy.mock.calls[0][0].itemsToAdd!;
		expect(loot.amount(attackPotion3.id)).toBe(0);
		expect(loot.amount(attackPotion4.id)).toBe(1);
		expect(loot.amount('Eye of newt')).toBe(1);
		expect(loot.amount('Guam potion (unf)')).toBe(0);
		expect(user.addXP).toHaveBeenCalledWith({ skillName: 'herblore', amount: 25, duration: 1 });
		expect(handleTripFinish).toHaveBeenCalledWith(
			expect.objectContaining({
				message: expect.stringContaining('Your prescription goggles saved'),
				loot
			})
		);
	});
});
