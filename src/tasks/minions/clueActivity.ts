import { Task } from 'klasa';

import { Events } from '../../lib/constants';
import clueTiers from '../../lib/minions/data/clueTiers';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: ClueActivityTaskOptions) {
		const { clueID, userID, channelID, quantity, duration } = data;
		const clueTier = clueTiers.find(mon => mon.id === clueID);
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);

		const logInfo = `ClueID[${clueID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}]`;

		if (!clueTier) {
			this.client.emit(Events.Wtf, `Missing user or clue - ${logInfo}`);
			return;
		}

		const str = `${user}, ${user.minionName} finished completing ${quantity} ${
			clueTier.name
		} clues. ${user.minionName} carefully places the reward casket${
			quantity > 1 ? 's' : ''
		} in your bank. You can open this casket using \`+open ${clueTier.name}\``;

		const loot = { [clueTier.id]: quantity };
		await user.addItemsToBank(loot, true);

		this.client.emit(
			Events.Log,
			`${user.username}[${user.id}] received ${quantity} ${clueTier.name} Clue Caskets.`
		);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			user.settings.get(UserSettings.Bank)[clueTier.scrollID]
				? res => {
						user.log(`continued trip of ${quantity}x ${clueTier.name} clues`);
						return this.client.commands
							.get('mclue')!
							.run(res, [quantity, clueTier.name]);
				  }
				: undefined,
			data,
			undefined,
			loot
		);
	}
}
