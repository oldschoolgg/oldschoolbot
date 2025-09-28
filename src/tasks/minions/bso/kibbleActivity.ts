import { kibbles } from '@/lib/bso/kibble.js';

import { Bank } from 'oldschooljs';

import type { KibbleOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';

export const kibbleTask: MinionTask = {
	type: 'KibbleMaking',
	async run(data: KibbleOptions) {
		const { quantity, channelID, userID, kibbleType, duration } = data;
		const user = await mUserFetch(userID);

		const kibble = kibbles.find(k => k.type === kibbleType)!;
		const loot = new Bank().add(kibble.item.id, quantity);
		await user.addItemsToBank({ items: loot, collectionLog: true });
		let xpRes = await user.addXP({
			skillName: 'cooking',
			amount: kibble.xp * quantity,
			duration,
			minimal: true
		});
		xpRes += await user.addXP({
			skillName: 'herblore',
			amount: Math.floor((kibble.xp * quantity) / 2),
			duration,
			minimal: true
		});

		handleTripFinish(
			user,
			channelID,
			`${user}, your minion finished cooking ${quantity}x ${kibble.item.name}. ${xpRes}`,
			undefined,
			data,
			loot
		);
	}
};
