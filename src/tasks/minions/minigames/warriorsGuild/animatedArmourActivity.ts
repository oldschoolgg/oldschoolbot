import { Task } from 'klasa';

import { Armours } from '../../../../commands/Minion/warriorsguild';
import { MinigameIDsEnum } from '../../../../lib/minions/data/minigames';
import { AnimatedArmourActivityTaskOptions } from '../../../../lib/types/minions';
import { noOp } from '../../../../lib/util';
import { channelIsSendable } from '../../../../lib/util/channelIsSendable';

export default class extends Task {
	async run({
		armourID,
		userID,
		channelID,
		quantity,
		duration
	}: AnimatedArmourActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const channel = await this.client.channels.fetch(channelID).catch(noOp);
		const armour = Armours.find(armour => armour.name === armourID);

		if (!armour) {
			throw `WTF!`;
		}

		const str = `${user}, ${user.minionName} finished killing ${quantity}x animated ${
			armour.name
		} armour and received ${quantity * armour.tokens}x Warrior guild tokens.`;
		const loot = {
			8851: quantity * armour.tokens
		};

		user.incrementMinigameScore(MinigameIDsEnum.AnimatedArmour, quantity);
		await user.addItemsToBank(loot, true);

		// TODO: Combat calculations in future depending on HP

		if (!channelIsSendable(channel)) return;

		return channel.send(str);
	}
}
