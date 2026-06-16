import type { RNGProvider } from 'node-rng';
import { Bank, convertLVLtoXP } from 'oldschooljs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import './setup.js';

import type { IPatchData } from '../../src/lib/skilling/skills/farming/utils/types.js';
import type { FarmingActivityTaskOptions } from '../../src/lib/types/minions.js';
import { executeFarmingStep } from '../../src/tasks/minions/farmingStep.js';
import { mockMUser } from './userutil.js';
import '../../src/lib/util/clientSettings.js';

describe('farmingStep tree fee handling', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('refunds excess prepaid tree removal fee when actual fee is lower', async () => {
		const user = mockMUser({
			id: '123',
			skills_woodcutting: convertLVLtoXP(1),
			GP: 0
		});
		const addItemsToBankSpy = vi.spyOn(user, 'addItemsToBank').mockResolvedValue(undefined as any);
		const removeItemsFromBankSpy = vi.spyOn(user, 'removeItemsFromBank').mockResolvedValue(undefined as any);
		vi.spyOn(user, 'addXP').mockResolvedValue('');
		vi.spyOn(user, 'update').mockResolvedValue(user);
		vi.spyOn(user, 'statsBankUpdate').mockResolvedValue(undefined);
		vi.spyOn(global.ClientSettings, 'updateBankSetting').mockResolvedValue();
		const transactResult = {
			newUser: user,
			itemsAdded: new Bank(),
			itemsRemoved: new Bank(),
			newBank: user.bank.clone(),
			newCL: user.cl.clone(),
			previousCL: new Bank(),
			clLootBank: null
		} satisfies Awaited<ReturnType<typeof user.transactItems>>;
		vi.spyOn(user, 'transactItems').mockResolvedValue(transactResult);

		const patchType: IPatchData = {
			lastPlanted: 'Oak tree',
			patchPlanted: true,
			plantTime: Date.now() - 1000,
			lastQuantity: 1,
			lastUpgradeType: null,
			lastPayment: true
		};

		const data: FarmingActivityTaskOptions = {
			type: 'Farming',
			userID: user.id,
			channelId: 'test-channel',
			id: 1,
			finishDate: Date.now() + 60_000,
			plantsName: 'Oak tree',
			quantity: 1,
			upgradeType: null,
			payment: false,
			treeChopFeePaid: 400,
			treeChopFeePlanned: 400,
			patchType,
			planting: false,
			duration: 60_000,
			currentDate: Date.now(),
			autoFarmed: true
		};

		const rng: RNGProvider = {
			roll: () => false,
			randInt: () => 1,
			randFloat: () => 0,
			rand: () => 0,
			shuffle: <T>(arr: T[]) => arr,
			pick: <T>(arr: T[]) => arr[0],
			percentChance: () => false,
			randomVariation: (value: number) => value
		};

		const result = await executeFarmingStep({
			user,
			channelID: 'test-channel',
			data,
			rng
		});

		expect(result).not.toBeNull();
		expect(removeItemsFromBankSpy).not.toHaveBeenCalled();
		expect(addItemsToBankSpy).toHaveBeenCalledTimes(1);
		const refundArg = addItemsToBankSpy.mock.calls[0]?.[0] as { items: Bank } | undefined;
		expect(refundArg?.items.amount('Coins')).toBe(200);
		expect(result?.message).toContain('200 GP was refunded');
	});
});
