import { Events } from '@oldschoolgg/toolkit';
import { Bank, EMonster, itemID } from 'oldschooljs';
import { afterEach, describe, expect, test, vi } from 'vitest';

import announceLoot from '@/lib/minions/functions/announceLoot.js';
import { mockMUser } from './userutil.js';

const originalGlobalClient = globalThis.globalClient;

afterEach(() => {
	vi.restoreAllMocks();
	globalThis.globalClient = originalGlobalClient;
});

describe('announceLoot', () => {
	test('announces normal monster loot with KC progress', async () => {
		const emit = vi.fn();
		globalThis.globalClient = { emit } as unknown as typeof globalClient;
		const user = mockMUser();
		vi.spyOn(user, 'getKC').mockResolvedValue(12);

		await announceLoot({
			user,
			monsterID: EMonster.MAN,
			loot: new Bank().add('Egg'),
			notifyDrops: [itemID('Egg')]
		});

		expect(emit).toHaveBeenCalledWith(
			Events.ServerNotification,
			"**Magnaboy's** minion, <:minion:778418736180494347> Your minion, just received **1x Egg**, their Man KC is 12!"
		);
	});

	test('announces Doom loot with delves progress', async () => {
		const emit = vi.fn();
		globalThis.globalClient = { emit } as unknown as typeof globalClient;
		const user = mockMUser();
		const getKCSpy = vi.spyOn(user, 'getKC');

		await announceLoot({
			user,
			monsterID: EMonster.DOOM_OF_MOKHAIOTL,
			monsterName: 'Doom of Mokhaiotl',
			progress: {
				name: 'Doom of Mokhaiotl Total Delves',
				value: 17
			},
			loot: new Bank().add('Avernic treads'),
			notifyDrops: [itemID('Avernic treads')]
		});

		expect(getKCSpy).not.toHaveBeenCalled();
		expect(emit).toHaveBeenCalledWith(
			Events.ServerNotification,
			"**Magnaboy's** minion, <:minion:778418736180494347> Your minion, just received **1x Avernic treads**, their Doom of Mokhaiotl Total Delves is 17!"
		);
	});
});
