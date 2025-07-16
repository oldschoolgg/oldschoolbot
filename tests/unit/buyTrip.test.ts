import { repeatTrip } from '@/lib/util/repeatStoredTrip';
import { describe, expect, test, vi } from 'vitest';
import { minionActivityCache } from '../../src/lib/constants';
import { tripBuyables } from '../../src/lib/data/buyables/tripBuyables';
import { minionStatus } from '../../src/lib/util/minionStatus';
import { mockMUser } from './userutil';

const packIndex = tripBuyables.findIndex(tb => tb.displayName === 'Chaos rune (pack)');
const packBuyable = tripBuyables[packIndex];

describe('buy trip helpers', () => {
	test('minionStatus displays pack count', () => {
		const user = mockMUser({ id: '123' });
		minionActivityCache.set(user.id, {
			type: 'Buy',
			userID: user.id,
			duration: 1000,
			id: 1,
			finishDate: Date.now() + 1000,
			channelID: '1',
			itemID: packBuyable.item,
			quantity: packBuyable.quantity! * 5,
			totalCost: 0,
			buyableIndex: packIndex
		});
		const status = minionStatus(user);
		expect(status).toContain('5x Chaos rune (pack)');
		minionActivityCache.clear();
	});

	test('repeatTrip uses pack quantity', async () => {
		const runCommandMock = vi.fn();
		vi.doMock('../../src/lib/settings/settings', async () => {
			const actual: any = await vi.importActual('../../src/lib/settings/settings');
			return { ...actual, runCommand: runCommandMock };
		});

		const fakeInteraction: any = {
			guildId: '1',
			member: null,
			channelId: '1',
			user: { id: '123' },
			message: { createdTimestamp: 0 },
			createdAt: new Date()
		};
		await repeatTrip(
			fakeInteraction as any,
			{
				data: {
					type: 'Buy',
					userID: '123',
					duration: 1000,
					id: 1,
					finishDate: Date.now(),
					channelID: '1',
					itemID: packBuyable.item,
					quantity: packBuyable.quantity! * 5,
					totalCost: 0,
					buyableIndex: packIndex
				},
				type: 'Buy'
			} as any
		);
		expect(runCommandMock).toHaveBeenCalled();
		const call = runCommandMock.mock.calls[0][0];
		expect(call.args.quantity).toBe(5);
		expect(call.args.name).toBe('Chaos rune (pack)');
	});
});
