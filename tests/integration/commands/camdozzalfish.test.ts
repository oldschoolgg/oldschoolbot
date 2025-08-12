import { increaseNumByPercent } from 'e';
import { ItemGroups, convertLVLtoXP } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { Fishing } from '@/lib/skilling/skills/fishing/fishing';
import { activitiesCommand } from '@/mahoji/commands/activities';
import { createTestUser } from '../util';

describe('Camdozzal Fish Command', async () => {
	it('should give angler boost', async () => {
		const user = await createTestUser();
		await user.equip('skilling', ItemGroups.anglerOutfit);
		const startingXP = convertLVLtoXP(80);
		await user.update({ skills_fishing: startingXP, QP: 100 });
		const res = await user.runCommand(activitiesCommand, {
			camdozaal: {
				action: 'fishing',
				quantity: 50
			}
		});
		expect(res).toContain('is now fishing in');
		await user.runActivity();
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
