import { randFloat, randInt, roll } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { Bank, LootTable } from 'oldschooljs';

import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import { skillingPetDropRate } from '@/lib/util.js';
import { VolcanicMineGameTime } from '@/mahoji/lib/abstracted_commands/volcanicMineCommand.js';

const fossilTable = new LootTable()
	.add('Unidentified small fossil', 1, 10)
	.add('Unidentified medium fossil', 1, 5)
	.add('Unidentified large fossil', 1, 4)
	.add('Unidentified rare fossil', 1, 1);
const numuliteTable = new LootTable().every('Numulite', 5).add('Calcite', 1).add('Pyrophosphite', 1);
const fragmentTable = new LootTable({ limit: 175 }).add(numuliteTable, 1, 45).add(fossilTable, 1, 5);

export const vmTask: MinionTask = {
	type: 'VolcanicMine',
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish }) {
		const { quantity, channelID, duration } = data;
		const userMiningLevel = user.skillsAsLevels.mining;
		let boost = 1;
		// Activity boosts
		if (userMiningLevel >= 99 && user.hasEquippedOrInBank('Dwarven pickaxe')) {
			boost += 2;
		} else if (userMiningLevel >= 71 && user.hasEquippedOrInBank('Crystal pickaxe')) {
			boost += 0.5;
		} else if (userMiningLevel >= 61 && user.hasEquippedOrInBank('Dragon pickaxe')) {
			boost += 0.3;
		}
		if (
			user.hasEquippedOrInBank(
				['Prospector helmet', 'Prospector jacket', 'Prospector legs', 'Prospector boots'],
				'every'
			)
		) {
			boost += 0.025;
		}

		let xpReceived = Math.round(
			userMiningLevel * ((VolcanicMineGameTime * quantity) / Time.Minute) * 10 * boost * randFloat(1.02, 1.08)
		);

		// Boost XP for having doug equipped
		if (user.usingPet('Doug')) xpReceived = Math.floor(xpReceived * 1.2);

		const xpRes = await user.addXP({
			skillName: 'mining',
			amount: xpReceived,
			duration
		});

		let warningMessage = '';

		const currentUserPoints = user.user.volcanic_mine_points;
		let pointsReceived = Math.round(xpReceived / 5.5);

		const flappyRes = await user.hasFlappy(duration);

		if (flappyRes.shouldGiveBoost) {
			pointsReceived *= 2;
		}

		const maxPoints = 2_097_151;

		await user.update({
			volcanic_mine_points: Math.min(maxPoints, currentUserPoints + pointsReceived)
		});

		if (currentUserPoints + pointsReceived > maxPoints) {
			const lostPoints = currentUserPoints + pointsReceived - maxPoints;
			pointsReceived -= lostPoints;
			warningMessage += `You did not received ${lostPoints.toLocaleString()} points, because you can't have more than ${maxPoints.toLocaleString()} points at the same time. Expend some on the Volcanic Mine shop.`;
		} else if (currentUserPoints + pointsReceived * 5 > maxPoints) {
			warningMessage += `You are getting close to the maximum amount of points that you can carry (${maxPoints.toLocaleString()}). You should expend some on the Volcanic Mine shop.`;
		}

		await user.incrementMinigameScore('volcanic_mine', quantity);

		const fragmentRolls = randInt(38, 40) * quantity;
		const loot = new Bank().add(fragmentTable.roll(fragmentRolls));
		const { petDropRate } = skillingPetDropRate(user, 'mining', 60_000);
		// Iterate over the fragments received
		for (let i = 0; i < fragmentRolls; i++) {
			// Roll for pet --- Average 40 fragments per game at 60K chance per fragment
			if (roll(petDropRate)) loot.add('Rock golem');
		}

		// 4x Loot for having doug helping, as it helps mining more fragments
		if (flappyRes.shouldGiveBoost) loot.multiply(2);

		let str = `${user}, ${user.minionName} finished playing ${quantity} games of Volcanic Mine.\n${xpRes}${
			loot.length > 0 ? `\nYou received ${loot}` : ''
		}\nYou received **${pointsReceived.toLocaleString()}** Volcanic Mine points. ${warningMessage}`;

		if (flappyRes.userMsg) {
			str += `\n${flappyRes.userMsg}`;
		}

		const { itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, itemsAdded);
	}
};
