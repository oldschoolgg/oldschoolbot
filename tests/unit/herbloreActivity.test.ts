import { Bank } from 'oldschooljs';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { Mock } from 'vitest';

import * as degradeableItemsModule from '../../src/lib/degradeableItems';
import type { HerbloreActivityTaskOptions } from '../../src/lib/types/minions';
import getOSItem from '../../src/lib/util/getOSItem';
import * as handleTripFinishModule from '../../src/lib/util/handleTripFinish';
import * as rngModule from '../../src/lib/util/rng';
import { herbloreTask } from '../../src/tasks/minions/herbloreActivity';
import { mockMUser } from './userutil';

const chemistryItem = getOSItem('Amulet of chemistry');
const attackPotion3 = getOSItem('Attack potion (3)');
const attackPotion4 = getOSItem('Attack potion (4)');

const globalAny = globalThis as unknown as {
	mUserFetch?: (...args: any[]) => Promise<any>;
	transactItems?: (...args: any[]) => Promise<any>;
};

const originalMUserFetch = globalAny.mUserFetch;
const originalTransactItems = globalAny.transactItems;

function defaultTaskData(overrides: Partial<HerbloreActivityTaskOptions> = {}): HerbloreActivityTaskOptions {
	return {
		type: 'Herblore',
		mixableID: attackPotion3.id,
		quantity: 3,
		zahur: false,
		wesley: false,
		userID: '123',
		channelID: '456',
		duration: 1,
		...overrides
	};
}

describe('herbloreTask amulet of chemistry behaviour', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		globalAny.mUserFetch = originalMUserFetch;
		globalAny.transactItems = originalTransactItems;
	});

	test('produces four-dose potions and consumes charges when the amulet procs', async () => {
		const user = mockMUser({ id: '123' });
		user.gear.skilling.equip(chemistryItem);
		user.addXP = vi.fn().mockResolvedValue('xp result');

		const percentResults = [true, true, false];
		const percentSpy = vi
			.spyOn(rngModule, 'percentChance')
			.mockImplementation(() => percentResults.shift() ?? false);
		const checkSpy = vi.spyOn(degradeableItemsModule, 'checkDegradeableItemCharges').mockResolvedValue(5);
		const degradeSpy = vi.spyOn(degradeableItemsModule, 'degradeItem').mockResolvedValue({
			userMessage: 'Your Amulet of chemistry degraded by 2 charges.',
			chargesToDegrade: 2
		});
		const handleSpy = vi.spyOn(handleTripFinishModule, 'handleTripFinish').mockResolvedValue();

		globalAny.mUserFetch = vi.fn().mockResolvedValue(user);
		globalAny.transactItems = vi.fn().mockResolvedValue({});

		await herbloreTask.run(defaultTaskData());

		expect(percentSpy).toHaveBeenCalledTimes(3);
		expect(checkSpy).toHaveBeenCalledWith({ item: chemistryItem, user });
		expect(degradeSpy).toHaveBeenCalledWith({ item: chemistryItem, chargesToDegrade: 2, user });

		const transactCall = (globalAny.transactItems as unknown as Mock).mock.calls[0][0];
		expect(transactCall).toMatchObject({ userID: user.id, collectionLog: true });
		expect(transactCall.itemsToAdd).toBeInstanceOf(Bank);
		expect(transactCall.itemsToAdd.amount(attackPotion4.id)).toBe(2);
		expect(transactCall.itemsToAdd.amount(attackPotion3.id)).toBe(1);

		expect(handleSpy).toHaveBeenCalled();
		const message = handleSpy.mock.calls[0][2] as string;
		expect(message).toContain(`2x ${attackPotion4.name} were made thanks to your Amulet of chemistry.`);
	});

	test('skips amulet logic when it is not equipped', async () => {
		const user = mockMUser({ id: '789' });
		user.addXP = vi.fn().mockResolvedValue('xp result');

		const percentSpy = vi.spyOn(rngModule, 'percentChance').mockReturnValue(true);
		const checkSpy = vi.spyOn(degradeableItemsModule, 'checkDegradeableItemCharges').mockResolvedValue(5);
		const degradeSpy = vi.spyOn(degradeableItemsModule, 'degradeItem');
		const handleSpy = vi.spyOn(handleTripFinishModule, 'handleTripFinish').mockResolvedValue();

		globalAny.mUserFetch = vi.fn().mockResolvedValue(user);
		globalAny.transactItems = vi.fn().mockResolvedValue({});

		await herbloreTask.run(defaultTaskData({ userID: '789' }));

		expect(percentSpy).not.toHaveBeenCalled();
		expect(checkSpy).not.toHaveBeenCalled();
		expect(degradeSpy).not.toHaveBeenCalled();

		const transactCall = (globalAny.transactItems as unknown as Mock).mock.calls[0][0];
		expect(transactCall.itemsToAdd.amount(attackPotion4.id)).toBe(0);
		expect(transactCall.itemsToAdd.amount(attackPotion3.id)).toBe(3);

		const message = handleSpy.mock.calls[0][2] as string;
		expect(message).not.toContain('Amulet of chemistry');
	});
});
