import { Bank } from 'oldschooljs';

import { Emoji, Events } from '../../../lib/constants';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { TitheFarmActivityTaskOptions } from '../../../lib/types/minions';
import { roll, skillingPetDropRate } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { userStatsUpdate } from '../../../mahoji/mahojiSettings';

export const titheFarmTask: MinionTask = {
	type: 'TitheFarm',
	async run(data: TitheFarmActivityTaskOptions) {
		const { userID, channelID } = data;
		const baseHarvest = 85;
		const lootStr: string[] = [];

		const user = await mUserFetch(userID);
		const userStats = await user.fetchStats({ tithe_farm_points: true, tithe_farms_completed: true });

		const farmingLvl = user.skillLevel(SkillsEnum.Farming);
		const titheFarmsCompleted = userStats.tithe_farms_completed;
		const titheFarmPoints = userStats.tithe_farm_points;

		const determineHarvest = baseHarvest + Math.min(15, titheFarmsCompleted);
		const determinePoints = determineHarvest - 74;

		await userStatsUpdate(
			user.id,
			{
				tithe_farms_completed: {
					increment: 1
				},
				tithe_farm_points: {
					increment: determinePoints
				}
			},
			{}
		);

		let fruit = '';
		let fruitXp = 0;
		if (farmingLvl < 54) {
			fruitXp = 6;
			fruit = 'golovanova';
		} else if (farmingLvl < 74) {
			fruitXp = 14;
			fruit = 'bologano';
		} else {
			fruitXp = 23;
			fruit = 'logavano';
		}

		const harvestXp = determineHarvest * fruitXp;
		const depositXp = 74 * 10 * fruitXp + (determineHarvest - 74) * 20 * fruitXp;
		const bonusFruitXp = 250 * fruitXp;
		const farmingXp = harvestXp + depositXp + bonusFruitXp;

		const harvestStr = `${user} ${user.minionName} successfully harvested ${determineHarvest}x ${fruit} fruit.`;
		const completedStr = `You have completed the ${Emoji.MinigameIcon} Tithe Farm ${
			titheFarmsCompleted + 1
		}x times. You now have ${titheFarmPoints + determinePoints} points to spend.`;

		let bonusXpMultiplier = 0;
		let farmersPiecesCheck = 0;
		if (user.hasEquippedOrInBank(["Farmer's strawhat"])) {
			bonusXpMultiplier += 0.004;
			farmersPiecesCheck += 1;
		}
		if (user.hasEquippedOrInBank(["Farmer's jacket", "Farmer's shirt"], 'every')) {
			bonusXpMultiplier += 0.008;
			farmersPiecesCheck += 1;
		}
		if (user.hasEquippedOrInBank(["Farmer's boro trousers"])) {
			bonusXpMultiplier += 0.006;
			farmersPiecesCheck += 1;
		}
		if (user.hasEquippedOrInBank(["Farmer's boots"])) {
			bonusXpMultiplier += 0.002;
			farmersPiecesCheck += 1;
		}
		if (farmersPiecesCheck === 4) bonusXpMultiplier += 0.005;

		const bonusXp = (harvestXp + depositXp) * bonusXpMultiplier;
		const totalXp = farmingXp + bonusXp;

		let bonusXpStr = '';
		if (bonusXp > 0) {
			bonusXpStr = `You received an additional ${Math.floor(bonusXp)} Bonus XP from your farmer's outfit pieces.`;
		}

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Farming,
			amount: Math.floor(totalXp),
			duration: data.duration
		});

		const loot = new Bank();
		const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Farming, 7_494_389);
		if (roll(petDropRate / determineHarvest)) {
			loot.add('Tangleroot');
			lootStr.push('\n\n```diff');
			lootStr.push("\n- You have a funny feeling you're being followed...");
			lootStr.push('```');
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Farming} **${user.badgedUsername}'s** minion, ${
					user.minionName
				}, just received a Tangleroot by completing the ${Emoji.MinigameIcon} Tithe Farm on their ${
					titheFarmsCompleted + 1
				} run!`
			);

			await transactItems({
				userID: user.id,
				collectionLog: true,
				itemsToAdd: loot
			});
		}

		const returnStr = `${harvestStr} ${xpRes} ${bonusXpStr}\n\n${completedStr}${lootStr}\n`;

		handleTripFinish(user, channelID, returnStr, undefined, data, loot.length > 0 ? loot : null);
	}
};
