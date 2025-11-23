import type { KibbleOptions } from '@/lib/bso/bsoTypes.js';
import { kibbles } from '@/lib/bso/kibble.js';

import { Bank } from 'oldschooljs';

export const kibbleTask: MinionTask = {
	type: 'KibbleMaking',
	async run(data: KibbleOptions, { user, handleTripFinish }) {
		const { quantity, channelId, kibbleType, duration } = data;

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

		return handleTripFinish({
			user,
			channelId,
			message: `${user}, your minion finished cooking ${quantity}x ${kibble.item.name}. ${xpRes}`,
			data,
			loot
		});
	}
};
