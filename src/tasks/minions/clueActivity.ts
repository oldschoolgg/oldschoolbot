import { Task } from 'klasa';

import clueTiers from '../../lib/clueTiers';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { Events } from '../../lib/constants';
import { getMinionName } from '../../lib/util';
import { channelIsSendable } from '../../lib/util/channelIsSendable';

export default class extends Task {
	async run({ clueID, userID, channelID, quantity }: ClueActivityTaskOptions) {
		const clueTier = clueTiers.find(mon => mon.id === clueID);
		const user = await this.client.users.fetch(userID);

		const logInfo = `ClueID[${clueID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}]`;

		if (!clueTier || !user) {
			this.client.emit(Events.Wtf, `Missing user or clue - ${logInfo}`);
			return;
		}

		await user.addItemsToBank({ [clueTier.id]: quantity }, true);

		this.client.emit(
			Events.Log,
			`${user.username}[${user.id}] received ${quantity} ${clueTier.name} Clue Caskets.`
		);

		const str = `${user}, ${getMinionName(user)} finished completing ${quantity} ${
			clueTier.name
		} clues. ${getMinionName(user)} carefully places the reward casket${
			quantity > 1 ? 's' : ''
		} in your bank. You can open this casket using \`+open ${clueTier.name}\``;

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		this.client.queuePromise(() => {
			channel.send(str);
		});
	}
}
