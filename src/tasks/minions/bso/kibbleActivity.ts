import { Bank } from 'oldschooljs';

import { kibbles } from '../../../lib/data/kibble';
import { SkillsEnum } from '../../../lib/skilling/types';
import { KibbleOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const kibbleTask: MinionTask = {
	type: 'KibbleMaking',
	async run(data: KibbleOptions) {
		let { quantity, channelID, userID, kibbleType, duration } = data;
		const user = await mUserFetch(userID);

		const kibble = kibbles.find(k => k.type === kibbleType)!;
		const loot = new Bank().add(kibble.item.id, quantity);
		await user.addItemsToBank({ items: loot, collectionLog: true });
		let xpRes = await user.addXP({
			skillName: SkillsEnum.Cooking,
			amount: kibble.xp * quantity,
			duration,
			minimal: true
		});
		xpRes += await user.addXP({
			skillName: SkillsEnum.Herblore,
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
