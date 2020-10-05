import { Task } from 'klasa';

import { Armours } from '../../../../commands/Minion/warriorsguild';
import { AnimatedArmourActivityTaskOptions } from '../../../../lib/types/minions';
import { handleTripFinish } from '../../../../lib/util/handleTripFinish';
import { MinigameIDsEnum } from './../../../../lib/minions/data/minigames';

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

		handleTripFinish(this.client, user, channelID, str, res => {
			user.log(
				`continued trip of ${quantity}x  animated ${armour.name}[${MinigameIDsEnum.AnimatedArmour}]`
			);
			return this.client.commands
				.get('warriorsguild')!
				.run(res, [quantity, 'animated', armour.name]);
		});
	}
}
