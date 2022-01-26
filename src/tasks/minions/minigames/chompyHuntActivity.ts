import { roll } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { chompyHats } from '../../../commands/Minion/chompyhunt';
import { userhasDiaryTier, WesternProv } from '../../../lib/diaries';
import { getMinigameEntity, incrementMinigameScore } from '../../../lib/settings/settings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, userID } = data;
		const user = await this.client.fetchUser(userID);

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

		await user.addItemsToBank({ items: loot, collectionLog: true });
		let str = `${user}, ${user.minionName} finished hunting Chompy Birds, they killed ${quantity}x Chompies. You have now have ${newScore} Chompies total. You received **${loot}**.`;

		for (const [item, qty] of chompyHats) {
			if (newScore >= qty && previousScore < qty) {
				str += `\n\nCongratulations, you can now buy a ${item.name}!`;
			}
		}

		handleTripFinish(this.client, user, channelID, str, ['chompyhunt', []], undefined, data, loot);
	}
}
