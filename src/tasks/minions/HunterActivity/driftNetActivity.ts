import { Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import driftNetCreatures from '../../../lib/skilling/skills/hunter/driftNet';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

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

export default class extends Task {
	async run(data: ActivityTaskOptionsWithQuantity) {
		let { quantity, userID, channelID, duration } = data;
		const user = await this.client.fetchUser(userID);
		const currentHuntLevel = user.skillLevel(SkillsEnum.Hunter);
		const currentFishLevel = user.skillLevel(SkillsEnum.Fishing);

		// Current fishable creatures
		const fishShoal = driftNetCreatures.find(_fish => _fish.name === 'Fish shoal')!;

		let fishShoalCaught = quantity;

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
			skillName: SkillsEnum.Hunter,
			amount: huntXpReceived,
			duration
		})}`;
		xpRes += `\n${await user.addXP({ skillName: SkillsEnum.Fishing, amount: fishXpReceived, duration })}`;
		await user.incrementCreatureScore(fishShoal.id, fishShoalCaught);

		let str = `${user}, ${user.minionName} finished drift net fishing and caught ${quantity}x ${fishShoal.name}. ${xpRes}\n${user.minionName} asks if you'd like them to do another of the same trip.`;

		await user.addItemsToBank({ items: loot, collectionLog: true });
		str += `\n\nYou received: ${loot}.`;

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log('continued trip of Drift net fishing.');
				return this.client.commands
					.get('driftnet')!
					.run(res, [
						Math.floor(Math.min(user.maxTripLength('DriftNet') / Time.Minute, duration / Time.Minute))
					]);
			},
			undefined,
			data,
			loot
		);
	}
}
