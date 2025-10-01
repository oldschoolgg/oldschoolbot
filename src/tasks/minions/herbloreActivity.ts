import { percentChance, randInt } from '@oldschoolgg/rng';
import { Bank, EItem } from 'oldschooljs';

import { userhasDiaryTier, WildernessDiary } from '@/lib/diaries.js';
import Herblore from '@/lib/skilling/skills/herblore/herblore.js';
import type { HerbloreActivityTaskOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';

export const herbloreTask: MinionTask = {
	type: 'Herblore',
	async run(data: HerbloreActivityTaskOptions) {
		const { mixableID, quantity, zahur, wesley, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);
		const mixableItem = Herblore.Mixables.find(mixable => mixable.item.id === mixableID)!;
		const xpReceived = zahur && mixableItem.zahur ? 0 : quantity * mixableItem.xp;
		let outputQuantity = mixableItem.outputMultiple ? quantity * mixableItem.outputMultiple : quantity;

		// Special case for Lava scale shard
		if (mixableItem.item.id === EItem.LAVA_SCALE_SHARD) {
			const [hasWildyDiary] = await userhasDiaryTier(user, WildernessDiary.hard);
			const currentHerbLevel = user.skillsAsLevels.herblore;
			let scales = 0;
			// Having 99 herblore gives a 98% chance to recieve the max amount of shards
			const maxShardChance = currentHerbLevel >= 99 ? 98 : 0;
			// Completion of hard wilderness diary gives 50% more lava scale shards per lava scale, rounded down
			const diaryMultiplier = hasWildyDiary ? 1.5 : 1;

			if (wesley) {
				// Wesley always turns Lava scales into 3 lava scale shards
				scales = quantity * 3;
			} else {
				// Math for if the user is using their minion to make lava scale shards
				for (let i = 0; i < quantity; i++) {
					scales += Math.floor((percentChance(maxShardChance) ? 6 : randInt(3, 6)) * diaryMultiplier);
				}
			}
			outputQuantity = scales;
		}

		const xpRes = await user.addXP({ skillName: 'herblore', amount: xpReceived, duration });
		const loot = new Bank().add(mixableItem.item.id, outputQuantity);

		await user.transactItems({ collectionLog: true, itemsToAdd: loot });

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished making ${outputQuantity}x ${mixableItem.item.name}. ${xpRes}`,
			undefined,
			data,
			loot
		);
	}
};
