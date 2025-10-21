import { Bank } from 'oldschooljs';

import Runecraft from '@/lib/skilling/skills/runecraft.js';
import type { TiaraRunecraftActivityTaskOptions } from '@/lib/types/minions.js';

export const tiaraRunecraftTask: MinionTask = {
	type: 'TiaraRunecraft',
	async run(data: TiaraRunecraftActivityTaskOptions, { user, handleTripFinish }) {
		const { tiaraID, tiaraQuantity, channelID, duration } = data;

		const tiara = Runecraft.Tiaras.find(_tiara => _tiara.id === tiaraID)!;

		const xpReceived = tiaraQuantity * tiara.xp;
		const xpRes = `\n${await user.addXP({
			skillName: 'runecraft',
			amount: xpReceived,
			duration
		})}`;
		let str = `${user}, ${user.minionName} finished crafting ${tiaraQuantity} ${tiara.name}. ${xpRes}`;

		const loot = new Bank({
			[tiara.id]: tiaraQuantity
		});

		str += `\n\nYou received: ${loot}.`;

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
