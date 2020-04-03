import { Task } from 'klasa';

import clueTiers from '../../lib/clueTiers';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { Events, Emoji } from '../../lib/constants';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import itemID from '../../lib/util/itemID';
import { UserSettings } from '../../lib/UserSettings';
import { roll } from 'oldschooljs/dist/util/util';
import { randomItemFromArray } from '../../lib/util';

const easterEggMessages = [
	'While on an adventure finishing this clue, {name} stumbled upon an Easter Bunny who gave them an Easter Egg!',
	'{name} found an Easter Egg in the gardens of Falador while completing the clue scroll!',
	'The Easter Bunny gave {name} an Easter Egg while they were doing the clue scroll!',
	'{name} found an Easter Egg under a fountain in Lumbridge while completing the clue scroll!',
	'{name} found an Easter Egg sitting on a path while completing the clue scroll!',
	'{name} found an Easter Egg in the Tree Gnome Village maze completing the clue scroll!'
];

export default class extends Task {
	async run({ clueID, userID, channelID, quantity }: ClueActivityTaskOptions) {
		const clueTier = clueTiers.find(mon => mon.id === clueID);
		const user = await this.client.users.fetch(userID);

		const logInfo = `ClueID[${clueID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}]`;

		if (!clueTier || !user) {
			this.client.emit(Events.Wtf, `Missing user or clue - ${logInfo}`);
			return;
		}

		let str = `${user}, ${user.minionName} finished completing ${quantity} ${
			clueTier.name
		} clues. ${user.minionName} carefully places the reward casket${
			quantity > 1 ? 's' : ''
		} in your bank. You can open this casket using \`+open ${clueTier.name}\``;

		const loot = { [clueTier.id]: quantity };
		const easterEggID = itemID('Easter egg');
		if (roll(3)) {
			loot[easterEggID] = 1;
			str += `\n\n${Emoji.EasterEgg} **${randomItemFromArray(easterEggMessages).replace(
				'{name}',
				user.minionName
			)}**`;
		}

		await user.addItemsToBank(loot, true);

		this.client.emit(
			Events.Log,
			`${user.username}[${user.id}] received ${quantity} ${clueTier.name} Clue Caskets.`
		);

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		this.client.queuePromise(() => {
			channel.send(str);
		});
	}
}
