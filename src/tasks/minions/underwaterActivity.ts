import { percentChance } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { SkillsEnum } from '../../lib/skilling/types';
import type { UnderwaterAgilityThievingTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

// Bonus loot from clams and chests, TODO: check wiki in future for more accurate rates
const clamChestTable = new LootTable()
	.add('Numulite', [5, 24], 380)
	.add('Unidentified small fossil', 10)
	.add('Unidentified medium fossil', 6)
	.add('Unidentified large fossil', 1, 3)
	.add('Unidentified rare fossil', 1, 1);

export const underwaterAgilityThievingTask: MinionTask = {
	type: 'UnderwaterAgilityThieving',
	async run(data: UnderwaterAgilityThievingTaskOptions) {
		const { quantity, userID, channelID, duration, trainingSkill } = data;
		const user = await mUserFetch(userID);
		const currentThievingLevel = user.skillLevel(SkillsEnum.Thieving);
		const currentAgilityLevel = user.skillLevel(SkillsEnum.Agility);

		let successful = 0;
		// Search clam/chest until it becomes inactive chance
		const chanceOfSuccess = 0.043_88 * currentThievingLevel + 11.68;

		for (let i = 0; i < quantity; i++) {
			while (percentChance(chanceOfSuccess)) {
				successful++;
			}
		}

		const loot = new Bank().add("Mermaid's tear", successful);

		for (let i = 0; i < successful; i++) {
			loot.add(clamChestTable.roll());
		}

		const holesObstacles = quantity / 5;

		// Calculate Agility and Thieving xp from Glistening tears, assumes chests/clams and obstacles gives almost no xp/hour and therefor neglected
		const agilityXpReceived = Math.round(
			(trainingSkill === 'agility' ? 1.5 : trainingSkill === 'thieving' ? 0 : 1) *
				successful *
				0.018 *
				Math.pow(currentAgilityLevel, 2) +
				4.5 * holesObstacles
		);

		const thievingXpReceived = Math.round(
			(trainingSkill === 'thieving' ? 1.5 : trainingSkill === 'agility' ? 0 : 1) *
				successful *
				0.066 *
				Math.pow(currentThievingLevel, 2)
		);

		let xpRes = `\n${await user.addXP({
			skillName: SkillsEnum.Agility,
			amount: agilityXpReceived,
			duration,
			source: 'UnderwaterAgilityThieving'
		})}`;
		xpRes += `\n${await user.addXP({
			skillName: SkillsEnum.Thieving,
			amount: thievingXpReceived,
			duration,
			source: 'UnderwaterAgilityThieving'
		})}`;

		let str = `${user}, ${user.minionName} finished doing Underwater Agility and Thieving. ${xpRes}`;

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});
		str += `\n\nYou received: ${loot}.`;

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
