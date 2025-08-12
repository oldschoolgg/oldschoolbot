import { roll } from 'e';
import { Bank } from 'oldschooljs';

import { formatList } from '@/lib/util/smallUtils';
import { chompyHats } from '../../../lib/data/CollectionsExport';
import { WesternProv, userhasDiaryTier } from '../../../lib/diaries';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const chompHuntTask: MinionTask = {
	type: 'BigChompyBirdHunting',
	async run(data: MinigameActivityTaskOptionsWithNoChanges) {
		const { channelID, quantity, userID } = data;
		const user = await mUserFetch(userID);

		const previousScore = await user.fetchMinigameScore('big_chompy_bird_hunting');
		const { newScore } = await user.incrementMinigameScore('big_chompy_bird_hunting', quantity);

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
		let str = `${user}, ${user.minionName} finished hunting ${quantity}x Chompy birds, you now have ${newScore} KC. You received ${loot}.`;

		const newHats = chompyHats.filter(hat => newScore >= hat[1] && previousScore < hat[1]);
		if (newHats.length > 0) {
			str += `\nYou can now claim the following chompy bird hats: **${formatList(newHats.map(hat => hat[0].name))}**!`;
		}

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
