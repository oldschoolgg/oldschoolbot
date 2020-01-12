import { Task } from 'klasa';
import { Events } from '../lib/constants';
import { ClueActivityTaskOptions } from '../lib/types';
import { getMinionName } from '../lib/util';
import { TextChannel, DMChannel } from 'discord.js';

import clueTiers from '../lib/clueTiers';

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
		} clues. ${getMinionName(user)} carefully places the reward caskets in your bank.`;

		let channel = this.client.channels.get(channelID);
		if (!channel || !(channel instanceof TextChannel) || !channel.postable) {
			channel = await user.createDM();
			if (!channel) return;
		}

		if (!(channel instanceof DMChannel) && !(channel instanceof TextChannel)) {
			return;
		}

		channel.send(str);
	}
}
