import { Events } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { sendServerNotification } from '@/lib/util/serverNotification.js';
import { mockMUser } from './userutil.js';

describe('sendServerNotification', () => {
	const emitSpy = vi.fn();

	beforeEach(() => {
		vi.stubGlobal('globalClient', { emit: emitSpy });
	});

	afterEach(() => {
		emitSpy.mockReset();
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	test('emits a notification for a new collection-log item', () => {
		const user = mockMUser();

		sendServerNotification({
			user,
			item: 'Beaver',
			action: 'cutting',
			activity: 'Yew logs',
			level: 90,
			skill: 'Woodcutting',
			emoji: '🪓'
		});

		expect(emitSpy).toHaveBeenCalledWith(
			Events.ServerNotification,
			`🪓 **${user.badgedUsername}'s** minion, ${user.minionName}, just received a Beaver while cutting Yew logs at level 90 Woodcutting!`
		);
	});

	test('includes the quantity for multiple items', () => {
		const user = mockMUser();

		sendServerNotification({
			user,
			item: 'Rock golem',
			quantity: 2,
			action: 'mining',
			activity: 'a fallen Shooting Star',
			level: 85,
			skill: 'Mining'
		});

		expect(emitSpy).toHaveBeenCalledWith(
			Events.ServerNotification,
			`**${user.badgedUsername}'s** minion, ${user.minionName}, just received 2x Rock golem while mining a fallen Shooting Star at level 85 Mining!`
		);
	});

	test('does not emit a notification for an owned collection-log item', () => {
		const user = mockMUser({ cl: new Bank().add('Heron') });

		sendServerNotification({
			user,
			item: 'Heron',
			action: 'fishing',
			activity: 'sharks',
			level: 76,
			skill: 'Fishing'
		});

		expect(emitSpy).not.toHaveBeenCalled();
	});
});
