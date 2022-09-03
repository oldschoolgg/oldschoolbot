import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { ClueTiers } from '../../lib/clues/clueTiers';
import { Events } from '../../lib/constants';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { mUserFetch } from '../../mahoji/mahojiSettings';

export default class extends Task {
	async run(data: ClueActivityTaskOptions) {
		const { clueID, userID, channelID, quantity } = data;
		const clueTier = ClueTiers.find(mon => mon.id === clueID);
		const user = await mUserFetch(userID);

		const logInfo = `ClueID[${clueID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}]`;

		if (!clueTier) {
			globalClient.emit(Events.Wtf, `Missing user or clue - ${logInfo}`);
			return;
		}

		const str = `${user}, ${user.minionName} finished completing ${quantity} ${clueTier.name} clues. ${
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
		handleTripFinish(user, channelID, str, undefined, undefined, data, loot);
	}
}
