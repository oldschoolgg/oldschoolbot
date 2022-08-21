import { roll } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { userhasDiaryTier, WesternProv } from '../../../lib/diaries';
import { getMinigameEntity, incrementMinigameScore } from '../../../lib/settings/settings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { chompyHats } from '../../../mahoji/lib/abstracted_commands/chompyHuntCommand';
import { mahojiUsersSettingsFetch } from '../../../mahoji/mahojiSettings';

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, userID } = data;
		const user = await mUserFetch(userID);

		const mahojiUser = await mahojiUsersSettingsFetch(userID);
		const previousScore = (await getMinigameEntity(user.id)).big_chompy_bird_hunting;
		const { newScore } = await incrementMinigameScore(userID, 'big_chompy_bird_hunting', quantity);

		const loot = new Bank();

		const [hasElite] = await userhasDiaryTier(mahojiUser, WesternProv.elite);

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

		handleTripFinish(
			user,
			channelID,
			str,
			['activities', { chompy_hunt: { action: 'start' } }],
			undefined,
			data,
			loot
		);
	}
}
