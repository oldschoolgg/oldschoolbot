import { Bank } from 'oldschooljs';

import Runecraft from '../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../lib/skilling/types';
import type { TiaraRunecraftActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const tiaraRunecraftTask: MinionTask = {
	type: 'TiaraRunecraft',
	async run(data: TiaraRunecraftActivityTaskOptions) {
		const { tiaraID, tiaraQuantity, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);

		const tiara = Runecraft.Tiaras.find(_tiara => _tiara.id === tiaraID)!;

		const xpReceived = tiaraQuantity * tiara.xp;
		const xpRes = `\n${await user.addXP({
			skillName: SkillsEnum.Runecraft,
			amount: xpReceived,
			duration
		})}`;
		let str = `${user}, ${user.minionName} finished crafting ${tiaraQuantity} ${tiara.name}. ${xpRes}`;

		const loot = new Bank({
			[tiara.id]: tiaraQuantity
		});

		str += `\n\nYou received: ${loot}.`;

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
