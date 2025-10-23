import { increaseNumByPercent } from '@oldschoolgg/toolkit';
import { convertLVLtoXP, ItemGroups } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { Fishing } from '../../../src/lib/skilling/skills/fishing/fishing.js';
import { activitiesCommand } from '../../../src/mahoji/commands/activities.js';
import { createTestUser } from '../util.js';

describe('Camdozzal Fish Command', async () => {
	it('should give angler boost', async () => {
		const user = await createTestUser();
		await user.equip('skilling', ItemGroups.anglerOutfit);
		const startingXP = convertLVLtoXP(80);
		await user.update({ skills_fishing: startingXP, QP: 100 });
		const res = await user.runCmdAndTrip(activitiesCommand, {
			camdozaal: {
				action: 'fishing',
				quantity: 50
			}
		});
		expect(res.commandResult).toContain('is now fishing in');
		expect(user.bank.amount('Raw guppy')).toBeGreaterThan(0);
		const expectedXpGained = Fishing.camdozaalFishes.reduce((acc, fish) => {
			return acc + fish.xp * user.bank.amount(fish.id);
		}, 0);
		expect(Fishing.camdozaalFishes.filter(fish => user.bank.amount(fish.id) > 0).length).toBeGreaterThanOrEqual(3);
		expect(expectedXpGained).toBeGreaterThan(0);
		const expectedXpGainedWithAnglerBoost = increaseNumByPercent(expectedXpGained, 2.5);
		expect(expectedXpGainedWithAnglerBoost).toBeGreaterThan(expectedXpGained);
		expect(user.skillsAsXP.fishing).toEqual(Math.ceil(startingXP + expectedXpGainedWithAnglerBoost));
	});
});
