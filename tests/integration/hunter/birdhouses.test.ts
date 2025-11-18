import { Bank, EItem } from 'oldschooljs';
import { expect, test } from 'vitest';

import birdhouses from '@/lib/skilling/skills/hunter/birdHouseTrapping.js';
import { createTestUser } from '../util.js';

test('Birdhouses', async () => {
	const user = await createTestUser();
	async function birdHouseTrip(birdHouseName: string) {
		const res = await user.runCmdAndTrip('activities', {
			birdhouses: {
				action: 'harvest',
				birdhouse: birdHouseName
			}
		});
		return res;
	}

	expect(user.fetchBirdhouseData()).toMatchObject({
		isReady: false,
		birdhouse: null,
		lastPlaced: null
	});

	{
		expect((await birdHouseTrip('Basdfsde')).commandResult).toContain('not a valid birdhouse');
		expect((await birdHouseTrip('Bird house')).commandResult).toContain('needs 5 Hunter to place');
		await user.setLevel('hunter', 20);

		expect((await birdHouseTrip('Bird house')).commandResult).toContain(' needs 3 QP to do Birdhouse run');
		await user.setQP(5);

		expect((await birdHouseTrip('Bird house')).commandResult).toContain(' needs 5 Crafting');
		await user.setLevel('crafting', 20);

		expect((await birdHouseTrip('Bird house')).commandResult).toContain("You don't have enough seeds");

		await user.addItemsToBank({ items: new Bank().add(EItem.HAMMERSTONE_SEED, 1000).add(EItem.LOGS, 1000) });
		const workingResult = await birdHouseTrip('Bird house');
		expect(workingResult.activityResult).toMatchObject({
			placing: true,
			gotCraft: true,
			birdhouseId: EItem.BIRD_HOUSE
		});
		expect(workingResult.commandResult).toContain(
			'is now placing 4x Bird house. You baited the birdhouses with 40x Hammerstone seed'
		);
		await user.bankMatch(new Bank().add(EItem.HAMMERSTONE_SEED, 960).add(EItem.LOGS, 996));

		expect(user.fetchBirdhouseData()).toMatchObject({
			birdhouse: birdhouses[0]
		});
	}

	{
		await user.setLevel('hunter', 88);
		await user.setLevel('crafting', 88);
		await user.addItemsToBank({ items: new Bank().add(EItem.HAMMERSTONE_SEED, 1000).add(EItem.YEW_LOGS, 1000) });
		const plantingYewRes = await birdHouseTrip('Yew bird house');
		expect(plantingYewRes.commandResult).toContain('will be ready');
		await user.updateBirdhouseData({
			...(user.user.minion_birdhouseTraps as any),
			birdhouseTime: 0
		});
		const plantingYewRes2 = await birdHouseTrip('Yew bird house');

		// Should be collecting 4x normal bird house, planting 4x yew bird house
		expect(plantingYewRes2.commandResult).toContain(
			'is now collecting 4x Bird house, and then placing 4x Yew bird house'
		);
		expect(plantingYewRes2.activityResult).toMatchObject({
			birdhouseId: EItem.YEW_BIRD_HOUSE
		});
		expect(plantingYewRes2.data).toMatchObject({
			message: expect.stringContaining('finished placing 4x Yew bird house and collecting 4x full Bird house')
		});
		await user.sync();

		expect(user.fetchBirdhouseData()).toMatchObject({
			birdhouse: birdhouses.find(bh => bh.birdhouseItem === EItem.YEW_BIRD_HOUSE)
		});
	}
});
