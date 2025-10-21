import * as rngModule from '@oldschoolgg/rng';
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
		channelID: '456',
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
			newUser: user.user,
			clLootBank: null
		});

		// RNG: first two procs succeed, third fails -> 2x (4), 1x (3)
		const percentResults = [true, true, false];
		const percentSpy = vi
			.spyOn(rngModule, 'percentChance')
			.mockImplementation(() => percentResults.shift() ?? false);

		const checkSpy = vi.spyOn(degradeableItemsModule, 'checkDegradeableItemCharges').mockResolvedValue(5);
		const degradeSpy = vi.spyOn(degradeableItemsModule, 'degradeItem').mockResolvedValue({
			userMessage: 'Your Amulet of chemistry degraded by 2 charges.',
			chargesToDegrade: 2,
			chargesRemaining: 3
		});
		const handleSpy = vi.spyOn(handleTripFinishModule, 'handleTripFinish').mockResolvedValue();

		globalAny.mUserFetch = vi.fn().mockResolvedValue(user);

		await herbloreTask.run(defaultTaskData(), {
			user,
			handleTripFinish: handleTripFinishModule.handleTripFinish
		} as never);

		// RNG/charge plumbing
		expect(percentSpy).toHaveBeenCalledTimes(3);
		expect(checkSpy).toHaveBeenCalledWith({ item: chemistryItem, user });
		expect(degradeSpy).toHaveBeenCalledWith({ item: chemistryItem, chargesToDegrade: 2, user });

		// Loot: 2x (4), 1x (3)
		const transactCall = (transactSpy as unknown as Mock).mock.calls[0][0];
		expect(transactCall).toMatchObject({ collectionLog: true });
		expect(transactCall.itemsToAdd).toBeInstanceOf(Bank);
		expect(transactCall.itemsToAdd.amount(attackPotion4.id)).toBe(2);
		expect(transactCall.itemsToAdd.amount(attackPotion3.id)).toBe(1);

		expect(handleSpy).toHaveBeenCalled();
		const message = handleSpy.mock.calls[0][2] as string;

		expect(message).toContain(`finished making 1x ${attackPotion3.name} and 2x ${attackPotion4.name}.`);

		expect(message).toContain(`2x ${attackPotion4.name} were made thanks to your Amulet of chemistry.`);
		expect(message).toContain('Your Amulet of chemistry glows and loses 2 charges (3 left).');
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
			newUser: user.user,
			clLootBank: null
		});

		const percentSpy = vi.spyOn(rngModule, 'percentChance').mockReturnValue(true);
		const checkSpy = vi.spyOn(degradeableItemsModule, 'checkDegradeableItemCharges').mockResolvedValue(5);
		const degradeSpy = vi.spyOn(degradeableItemsModule, 'degradeItem');
		const handleSpy = vi.spyOn(handleTripFinishModule, 'handleTripFinish').mockResolvedValue();

		globalAny.mUserFetch = vi.fn().mockResolvedValue(user);

		await herbloreTask.run(defaultTaskData({ userID: '789' }), {
			user,
			handleTripFinish: handleTripFinishModule.handleTripFinish
		} as never);

		// No amulet => no RNG or charge checks
		expect(percentSpy).not.toHaveBeenCalled();
		expect(checkSpy).not.toHaveBeenCalled();
		expect(degradeSpy).not.toHaveBeenCalled();

		// All items remain (3-dose)
		const transactCall = (transactSpy as unknown as Mock).mock.calls[0][0];
		expect(transactCall.itemsToAdd.amount(attackPotion4.id)).toBe(0);
		expect(transactCall.itemsToAdd.amount(attackPotion3.id)).toBe(3);

		const message = handleSpy.mock.calls[0][2] as string;
		expect(message).not.toContain('Amulet of chemistry');

		expect(message).toContain(`finished making 3x ${attackPotion3.name}.`);
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
			newUser: user.user,
			clLootBank: null
		});

		// RNG never procs → 0x (4), 3x (3)
		const percentSpy = vi.spyOn(rngModule, 'percentChance').mockReturnValue(false);
		const checkSpy = vi.spyOn(degradeableItemsModule, 'checkDegradeableItemCharges').mockResolvedValue(5);
		const degradeSpy = vi.spyOn(degradeableItemsModule, 'degradeItem');
		const handleSpy = vi.spyOn(handleTripFinishModule, 'handleTripFinish').mockResolvedValue();

		globalAny.mUserFetch = vi.fn().mockResolvedValue(user);

		await herbloreTask.run(defaultTaskData(), {
			user,
			handleTripFinish: handleTripFinishModule.handleTripFinish
		} as never);

		// RNG called, but no degrade call since no successes
		expect(percentSpy).toHaveBeenCalledTimes(3);
		expect(checkSpy).toHaveBeenCalledWith({ item: chemistryItem, user });
		expect(degradeSpy).not.toHaveBeenCalled();

		// Loot: all (3-dose)
		const transactCall = (transactSpy as unknown as Mock).mock.calls[0][0];
		expect(transactCall.itemsToAdd.amount(attackPotion4.id)).toBe(0);
		expect(transactCall.itemsToAdd.amount(attackPotion3.id)).toBe(3);

		// No amulet messages; completion reflects total (3-dose) only
		expect(handleSpy).toHaveBeenCalled();
		const message = handleSpy.mock.calls[0][2] as string;
		expect(message).not.toContain('Amulet of chemistry');
		expect(message).not.toContain('glows and loses');
		expect(message).toContain(`finished making 3x ${attackPotion3.name}.`);
	});
});
