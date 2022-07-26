import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import Runecraft from '../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../lib/skilling/types';
import { TiaraRunecraftOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: TiaraRunecraftOptions) {
		const { userID, tiaraID, channelID, quantity, duration } = data;
		const user = await this.client.fetchUser(userID);
		const tiara = Runecraft.Tiara.find(_tiara => _tiara.id === tiaraID)!;
		const xpReceived = quantity * tiara.xp;

		let xpRes = `\n${await user.addXP({
			skillName: SkillsEnum.Runecraft,
			amount: xpReceived,
			duration
		})}`;
		let str = `${user}, ${user.minionName} finished crafting ${quantity} ${tiara.name}. ${xpRes}`;

		const loot = new Bank({
			[tiara.id]: quantity
		});

		str += `\n\nYou received: ${loot}.`;

		await user.addItemsToBank({ items: loot, collectionLog: true });

		handleTripFinish(
			user,
			channelID,
			str,
			['runecraft', { quantity, rune: tiara.name }, true],
			undefined,
			data,
			loot
		);
	}
}
