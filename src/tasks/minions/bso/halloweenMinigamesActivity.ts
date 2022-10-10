import { roll } from 'e';
import { Bank } from 'oldschooljs';

import { HALLOWEEN_BOX_DROPRATE, KURO_DROPRATE, miniMinigames } from '../../../lib/hweenEvent';
import { HalloweenMinigameOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const hweenTask: MinionTask = {
	type: 'HalloweenMiniMinigame',
	async run(data: HalloweenMinigameOptions) {
		const { channelID, minigameID, userID } = data;
		const user = await mUserFetch(userID);
		const minigame = miniMinigames.find(i => i.id === minigameID)!;
		const item = minigame.items.find(i => !user.cl.has(i));
		const loot = new Bank().add(item);
		loot.add(minigame.extraLoot.roll());
		if (roll(KURO_DROPRATE(user.cl.amount('Kuro')))) {
			loot.add('Kuro');
		}
		if (roll(HALLOWEEN_BOX_DROPRATE)) {
			loot.add('Spooky box');
		}

		await user.addItemsToBank({ items: loot, collectionLog: true });

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished playing a mini-minigame of ${minigame.name}! You received... ${loot}.`,
			undefined,
			data,
			null
		);
	}
};
