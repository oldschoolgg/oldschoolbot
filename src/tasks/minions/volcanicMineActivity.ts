import { randFloat, roll, Time } from 'e';
import { Task } from 'klasa';
import { Bank, LootTable } from 'oldschooljs';

import { VolcanicMineGameTime } from '../../commands/Minion/volcanicmine';
import { Emoji, Events } from '../../lib/constants';
import { incrementMinigameScore } from '../../lib/settings/settings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { ActivityTaskOptionsWithQuantity } from '../../lib/types/minions';
import { rand } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

const fossilTable = new LootTable()
	.add('Unidentified small fossil', 1, 10)
	.add('Unidentified medium fossil', 1, 5)
	.add('Unidentified large fossil', 1, 4)
	.add('Unidentified rare fossil', 1, 1);
const numuliteTable = new LootTable().every('Numulite', 5).add('Calcite', 1).add('Pyrophosphite', 1);
const fragmentTable = new LootTable({ limit: 175 }).add(numuliteTable, 1, 45).add(fossilTable, 1, 5);

export default class extends Task {
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { quantity, userID, channelID, duration } = data;
		const user = await this.client.fetchUser(userID);
		const userSkillingGear = user.getGear('skilling');
		const userMiningLevel = user.skillLevel(SkillsEnum.Mining);
		let boost = 1;
		// Activity boosts
		if (userMiningLevel >= 71 && userSkillingGear.hasEquipped('Crystal pickaxe')) {
			boost += 0.5;
		} else if (userMiningLevel >= 61 && userSkillingGear.hasEquipped('Dragon pickaxe')) {
			boost += 0.3;
		}
		if (
			userSkillingGear.hasEquipped(
				['Prospector helmet', 'Prospector jacket', 'Prospector legs', 'Prospector boots'],
				true
			)
		) {
			boost += 0.025;
		}

		const xpReceived = Math.round(
			userMiningLevel * ((VolcanicMineGameTime * quantity) / Time.Minute) * 10 * boost * randFloat(1.02, 1.08)
		);
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Mining,
			amount: xpReceived,
			duration
		});

		let warningMessage = '';

		const currentUserPoints = user.settings.get(UserSettings.VolcanicMinePoints);
		let pointsReceived = Math.round(xpReceived / 5.5);
		const maxPoints = 2_097_151;
		await user.settings.update(
			UserSettings.VolcanicMinePoints,
			Math.min(maxPoints, currentUserPoints + pointsReceived)
		);

		if (currentUserPoints + pointsReceived > maxPoints) {
			const lostPoints = currentUserPoints + pointsReceived - maxPoints;
			pointsReceived -= lostPoints;
			warningMessage += `You did not received ${lostPoints.toLocaleString()} points, because you can't have more than ${maxPoints.toLocaleString()} points at the same time. Expend some on the Volcanic Mine shop.`;
		} else if (currentUserPoints + pointsReceived * 5 > maxPoints) {
			warningMessage += `You are getting close to the maximum amount of points that you can carry (${maxPoints.toLocaleString()}). You should expend some on the Volcanic Mine shop.`;
		}

		await incrementMinigameScore(userID, 'volcanic_mine', quantity);

		const fragmentRolls = rand(38, 40) * quantity;
		const loot = new Bank().add(fragmentTable.roll(fragmentRolls));
		// Iterate over the fragments received
		for (let i = 0; i < fragmentRolls; i++) {
			// Roll for pet --- Average 40 fragments per game at 60K chance per fragment
			if (roll(60_000)) loot.add('Rock golem');
		}

		let str = `${user}, ${user.minionName} finished playing ${quantity} games of Volcanic Mine.\n${xpRes}${
			loot.length > 0 ? `\nYou received ${loot}` : ''
		}\nYou received **${pointsReceived.toLocaleString()}** Volcanic Mine points. ${warningMessage}`;

		if (loot.has('Rock golem')) {
			str += "\nYou have a funny feeling you're being followed...";
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Mining} **${user.username}'s** minion, ${user.minionName}, just received ${
					loot.amount('Rock golem') > 1 ? `${loot.amount('Rock golem')}x ` : 'a'
				} Rock golem while mining on the Volcanic Mine at level ${userMiningLevel} Mining!`
			);
		}

		const { itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: true });

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			['volcanicmine', [quantity], true],
			undefined,
			data,
			itemsAdded
		);
	}
}
