import { randFloat, roll, Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { VolcanicMineGameTime } from '../../commands/Minion/volcanicmine';
import { Emoji, Events } from '../../lib/constants';
import { GearSetupTypes } from '../../lib/gear';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { VolcanicMineActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: VolcanicMineActivityTaskOptions) {
		const { quantity, userID, channelID, duration } = data;
		const user = await this.client.fetchUser(userID);
		const userSkillingGear = user.getGear(GearSetupTypes.Skilling);
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

		await user.incrementMinigameScore('VolcanicMine', quantity);

		let str = `${user}, ${
			user.minionName
		} finished playing ${quantity} games of Volcanic Mine.\n${xpRes}\nYou received **${pointsReceived.toLocaleString()}** Volcanic Mine points. ${warningMessage}`;

		// Roll for pet --- Average 40 fragments per game at 60K chance per fragment
		const loot = new Bank();
		for (let i = 0; i < 40; i++) if (roll(60_000)) loot.add('Rock golem');

		if (loot.has('Rock golem')) {
			str += "\nYou have a funny feeling you're being followed...";
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Mining} **${user.username}'s** minion, ${user.minionName}, just received ${
					loot.amount('Rock golem') > 1 ? `${loot.amount('Rock golem')}x ` : 'a'
				} Rock golem while mining on the Volcanic Mine at level ${userMiningLevel} Mining!`
			);
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x Volcanic Mine`);
				return this.client.commands.get('volcanicmine')!.run(res, [quantity]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
