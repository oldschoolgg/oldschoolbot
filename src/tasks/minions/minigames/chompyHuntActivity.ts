import { roll } from 'e';
import { Bank } from 'oldschooljs';

import { chompyHats } from '../../../lib/constants';
import { WesternProv, userhasDiaryTier } from '../../../lib/diaries';
import { getMinigameEntity, incrementMinigameScore } from '../../../lib/settings/settings';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const chompHuntTask: MinionTask = {
	type: 'BigChompyBirdHunting',
	async run(data: MinigameActivityTaskOptionsWithNoChanges) {
		const { channelID, quantity, userID } = data;
		const user = await mUserFetch(userID);

		const previousScore = (await getMinigameEntity(user.id)).big_chompy_bird_hunting;
		const { newScore } = await incrementMinigameScore(userID, 'big_chompy_bird_hunting', quantity);

		const loot = new Bank();

		const [hasElite] = await userhasDiaryTier(user, WesternProv.elite);

		for (let i = 0; i < quantity; i++) {
			loot.add('Bones');
			loot.add('Raw chompy');
			if (hasElite && roll(250)) {
				loot.add('Chompy chick');
			}
		}

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});
		let str = `${user}, ${user.minionName} finished hunting Chompy Birds, they killed ${quantity}x Chompies. You have now have ${newScore} Chompies total. You received **${loot}**.`;

		for (const [item, qty] of chompyHats) {
			if (newScore >= qty && previousScore < qty) {
				str += `\n\nCongratulations, you can now buy a ${item.name}!`;
			}
		}

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
