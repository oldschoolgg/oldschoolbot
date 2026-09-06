import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { buildServerNotification } from '@/lib/util/serverNotification.js';
import { mockMUser } from './userutil.js';

describe('buildServerNotification', () => {
	test('builds a notification for a new collection-log item', () => {
		const user = mockMUser();

		expect(
			buildServerNotification({
				user,
				item: 'Beaver',
				action: 'cutting',
				activity: 'Yew logs',
				level: 90,
				skill: 'Woodcutting',
				emoji: '🪓'
			})
		).toBe(
			`🪓 **${user.badgedUsername}'s** minion, ${user.minionName}, just received a Beaver while cutting Yew logs at level 90 Woodcutting!`
		);
	});

	test('builds a notification with quantity', () => {
		const user = mockMUser();

		expect(
			buildServerNotification({
				user,
				item: 'Rock golem',
				quantity: 2,
				action: 'mining',
				activity: 'a fallen Shooting Star',
				level: 85,
				skill: 'Mining'
			})
		).toBe(
			`**${user.badgedUsername}'s** minion, ${user.minionName}, just received 2x Rock golem while mining a fallen Shooting Star at level 85 Mining!`
		);
	});

	test('returns no message for an owned collection-log item', () => {
		const user = mockMUser({ cl: new Bank().add('Heron') });

		expect(
			buildServerNotification({
				user,
				item: 'Heron',
				action: 'fishing',
				activity: 'sharks',
				level: 76,
				skill: 'Fishing'
			})
		).toBeUndefined();
	});
});
