import { activity_type_enum } from '@prisma/client';
import { randInt, reduceNumByPercent, roll } from 'e';
import { Bank } from 'oldschooljs';

import { isDoubleLootActive } from '../../../lib/doubleLoot';
import { HALLOWEEN_BOX_DROPRATE, KURO_DROPRATE, miniMinigames } from '../../../lib/hweenEvent';
import { prisma } from '../../../lib/settings/prisma';
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
		const completedMinigames = await prisma.activity.count({
			where: {
				user_id: BigInt(user.id),
				type: activity_type_enum.HalloweenMiniMinigame
			}
		});
		let kuroRate = KURO_DROPRATE(user.cl.amount('Kuro'));
		if (user.cl.amount('Kuro') === 0) {
			if (completedMinigames > 100) {
				kuroRate = Math.floor(reduceNumByPercent(kuroRate, 30));
			}
			if (completedMinigames > 150) {
				kuroRate = Math.floor(reduceNumByPercent(kuroRate, 30));
			}
			if (completedMinigames > 175) {
				kuroRate = Math.floor(reduceNumByPercent(kuroRate, 30));
			}
		}
		if (roll(kuroRate)) {
			loot.add('Kuro');
		}

		let boxDroprate = HALLOWEEN_BOX_DROPRATE;
		if (user.isIronman) boxDroprate /= 2;

		if (roll(boxDroprate)) {
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
