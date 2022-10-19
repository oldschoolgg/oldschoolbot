import { randInt, roll } from 'e';
import { Bank } from 'oldschooljs';

import { isDoubleLootActive } from '../../../lib/doubleLoot';
import { HALLOWEEN_BOX_DROPRATE, KURO_DROPRATE, miniMinigames } from '../../../lib/hweenEvent';
import { treatTable } from '../../../lib/simulation/pumpkinHead';
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
		if (roll(KURO_DROPRATE(user.cl.amount('Spooky gear frame unlock')))) {
			loot.add('Spooky gear frame unlock');
		}
		if (roll(KURO_DROPRATE(user.cl.amount('Kuro')))) {
			loot.add('Kuro');
		}
		if (roll(HALLOWEEN_BOX_DROPRATE)) {
			loot.add('Spooky box');
			if (isDoubleLootActive(data.duration)) {
				loot.add('Spooky box');
			}
		}
		const candyRolls = randInt(2, 5);
		loot.add(treatTable.roll(candyRolls));

		await user.addItemsToBank({ items: loot, collectionLog: true });

		let msg = `${user}, ${user.minionName} finished playing a mini-minigame of ${minigame.name}!`;
		if (loot.has('Kuro')) {
			msg +=
				"\n\n<:kuro:1032277900579319888> While you were playing, a cute black cat crossed your path. You pick it up so you don't trip.";
		}
		msg += `\n\n You found some Halloween candy, too. Your rewards: ${loot}`;

		handleTripFinish(user, channelID, msg, undefined, data, null);
	}
};
