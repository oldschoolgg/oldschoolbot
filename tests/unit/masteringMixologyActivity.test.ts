import type { RNGProvider } from 'node-rng';
import { Bank } from 'oldschooljs';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { MasteringMixologyContractActivityTaskOptions } from '@/lib/types/minions.js';
import { MasteringMixologyContractTask } from '@/tasks/minions/minigames/masteringMixologyActivity.js';

const originalMUserFetch = global.mUserFetch;
const originalClientSettings = global.ClientSettings;
const handleTripFinishMock = vi.fn();

function makeMixologyUser(startingBank?: Bank) {
	const bank = startingBank ?? new Bank().add('Mox paste', 30).add('Lye paste', 30).add('Aga paste', 30);

	return {
		id: '123',
		bank,
		minionName: 'Test minion',
		skillLevel: vi.fn(() => 99),
		owns: vi.fn((cost: Bank) => bank.has(cost)),
		removeItemsFromBank: vi.fn(async (cost: Bank) => {
			bank.remove(cost);
		}),
		incrementMinigameScore: vi.fn(),
		addXP: vi.fn(async () => 'You gained 570 Herblore XP.'),
		update: vi.fn()
	} as unknown as MUser;
}

describe('Mastering Mixology activity', () => {
	beforeEach(() => {
		handleTripFinishMock.mockReset();
		vi.spyOn(Math, 'random').mockReturnValue(0);
		global.ClientSettings = {
			updateBankSetting: vi.fn()
		} as unknown as typeof ClientSettings;
	});

	afterEach(() => {
		vi.restoreAllMocks();
		global.mUserFetch = originalMUserFetch;
		global.ClientSettings = originalClientSettings;
	});

	test('applies the three-contract hand-in bonus through the activity task', async () => {
		const user = makeMixologyUser();
		global.mUserFetch = vi.fn(async () => user) as typeof mUserFetch;
		const taskOptions: Parameters<MinionTask['run']>[1] = {
			user,
			handleTripFinish: handleTripFinishMock,
			rng: {} as RNGProvider
		};

		await MasteringMixologyContractTask.run(
			{
				type: 'MasteringMixologyContract',
				userID: user.id,
				channelId: 'test-channel',
				duration: 1,
				quantity: 3,
				minigameID: 'mastering_mixology'
			} as MasteringMixologyContractActivityTaskOptions,
			taskOptions
		);

		expect(user.removeItemsFromBank).toHaveBeenCalledTimes(3);
		expect(user.incrementMinigameScore).toHaveBeenCalledWith('mastering_mixology', 3);
		// 3 contracts x (190 base + 14 processing bonus)
		expect(user.addXP).toHaveBeenCalledWith({
			skillName: 'herblore',
			amount: 612,
			duration: expect.any(Number),
			source: 'MasteringMixology'
		});
		expect(user.update).toHaveBeenCalledWith({
			mixology_mox_points: { increment: 28 },
			mixology_aga_points: { increment: 28 },
			mixology_lye_points: { increment: 28 }
		});
		expect(ClientSettings.updateBankSetting).toHaveBeenCalledWith(
			'mastering_mixology_cost_bank',
			new Bank().add('Mox paste', 30).add('Lye paste', 30).add('Aga paste', 30)
		);
		expect(handleTripFinishMock).toHaveBeenCalledWith(
			expect.objectContaining({
				user,
				channelId: 'test-channel',
				message: expect.stringContaining('earning 84 points')
			})
		);
	});

	test('doubles the XP and points of a contract when digweed is found', async () => {
		const user = makeMixologyUser(new Bank().add('Mox paste', 30));
		global.mUserFetch = vi.fn(async () => user) as typeof mUserFetch;

		await MasteringMixologyContractTask.run(
			{
				type: 'MasteringMixologyContract',
				userID: user.id,
				channelId: 'test-channel',
				duration: 1,
				quantity: 1,
				minigameID: 'mastering_mixology'
			} as MasteringMixologyContractActivityTaskOptions,
			{
				user,
				handleTripFinish: handleTripFinishMock,
				rng: { roll: () => true } as unknown as RNGProvider
			}
		);

		// (190 base + 14 processing) x2 for digweed
		expect(user.addXP).toHaveBeenCalledWith(expect.objectContaining({ skillName: 'herblore', amount: 408 }));
		expect(user.update).toHaveBeenCalledWith(expect.objectContaining({ mixology_mox_points: { increment: 40 } }));
		expect(handleTripFinishMock).toHaveBeenCalledWith(
			expect.objectContaining({ message: expect.stringContaining('1x Digweed') })
		);
	});
});
