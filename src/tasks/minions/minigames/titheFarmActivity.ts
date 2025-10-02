import { userHasFlappy } from '@/lib/bso/skills/invention/inventions.js';

import { roll } from '@oldschoolgg/rng';
import { Emoji } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type { TitheFarmActivityTaskOptions } from '@/lib/types/minions.js';
import { skillingPetDropRate } from '@/lib/util.js';

export const titheFarmTask: MinionTask = {
	type: 'TitheFarm',
	async run(data: TitheFarmActivityTaskOptions, { user, handleTripFinish }) {
		const { channelID, duration } = data;
		const baseHarvest = 85;
		const lootStr: string[] = [];

		const userStats = await user.fetchStats();

		const farmingLvl = user.skillsAsLevels.farming;
		const titheFarmsCompleted = userStats.tithe_farms_completed;
		const titheFarmPoints = userStats.tithe_farm_points;

		const determineHarvest = baseHarvest + Math.min(15, titheFarmsCompleted);
		let determinePoints = determineHarvest - 74;

		const flappyRes = await userHasFlappy({ user, duration });
		if (flappyRes.shouldGiveBoost) {
			determinePoints *= 2;
		}

		await user.statsUpdate({
			tithe_farms_completed: {
				increment: 1
			},
			tithe_farm_points: {
				increment: determinePoints
			}
		});

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
			skillName: 'farming',
			amount: Math.floor(totalXp),
			duration: data.duration
		});

		const loot = new Bank();
		const { petDropRate } = skillingPetDropRate(user, 'farming', 7_494_389);
		if (roll(petDropRate / determineHarvest)) {
			loot.add('Tangleroot');

			await user.transactItems({
				collectionLog: true,
				itemsToAdd: loot
			});
		}

		const returnStr = `${harvestStr} ${xpRes} ${bonusXpStr}\n\n${completedStr}${lootStr}\n\n${flappyRes.userMsg}`;

		handleTripFinish(user, channelID, returnStr, undefined, data, loot.length > 0 ? loot : null);
	}
};
