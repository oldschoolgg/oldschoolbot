import { Bank } from 'oldschooljs';

import driftNetCreatures from '../../../lib/skilling/skills/hunter/driftNet.js';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions.js';

// Bonus loot from higher fishing level
const fishBonusLoot = [
	{
		item: 'Raw lobster',
		req: 50
	},
	{
		item: 'Raw swordfish',
		req: 60
	},
	{
		item: 'Raw shark',
		req: 70
	},
	{
		item: 'Raw sea turtle',
		req: 80
	},
	{
		item: 'Raw manta ray',
		req: 90
	}
];

export const driftNetTask: MinionTask = {
	type: 'DriftNet',
	isNew: true,
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish }) {
		const { quantity, channelID, duration } = data;
		const currentHuntLevel = user.skillsAsLevels.hunter;
		const currentFishLevel = user.skillsAsLevels.fishing;

		// Current fishable creatures
		const fishShoal = driftNetCreatures.find(_fish => _fish.name === 'Fish shoal')!;

		const fishShoalCaught = quantity;

		// Build up loot table based on fishing level
		const fishTable = fishShoal.table.clone();
		for (const bonus of fishBonusLoot) {
			if (currentFishLevel >= bonus.req) {
				fishTable.add(bonus.item);
			}
		}

		const loot = new Bank();

		for (let i = 0; i < quantity * 10; i++) {
			loot.add(fishTable.roll());
		}

		const huntXpReceived = Math.round(
			quantity * (fishShoal.hunterXP + Math.min(currentHuntLevel - 44, 26) * 11.35)
		);
		const fishXpReceived = Math.round(
			quantity * (fishShoal.fishingXP! + Math.min(currentFishLevel - 47, 23) * 8.91)
		);

		let xpRes = `\n${await user.addXP({
			skillName: 'hunter',
			amount: huntXpReceived,
			duration
		})}`;
		xpRes += `\n${await user.addXP({ skillName: 'fishing', amount: fishXpReceived, duration })}`;
		await user.incrementCreatureScore(fishShoal.id, fishShoalCaught);

		let str = `${user}, ${user.minionName} finished drift net fishing and caught ${quantity}x ${fishShoal.name}. ${xpRes}\n${user.minionName} asks if you'd like them to do another of the same trip.`;

		await user.transactItems({

			collectionLog: true,
			itemsToAdd: loot
		});
		str += `\n\nYou received: ${loot}.`;

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
