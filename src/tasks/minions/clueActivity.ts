import { Bank } from 'oldschooljs';

import { ClueTiers } from '../../lib/clues/clueTiers';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const clueTask: MinionTask = {
	type: 'ClueCompletion',
	async run(data: ClueActivityTaskOptions) {
		const { clueID, userID, channelID, quantity } = data;
		const clueTier = ClueTiers.find(mon => mon.id === clueID)!;
		const user = await mUserFetch(userID);

		const str = `${user.mention}, ${user.minionName} finished completing ${quantity} ${clueTier.name} clues. ${
			user.minionName
		} carefully places the reward casket${
			quantity > 1 ? 's' : ''
		} in your bank. You can open this casket using \`/open name:${clueTier.name}\``;

		const loot = new Bank().add(clueTier.id, quantity);
		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});
		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
