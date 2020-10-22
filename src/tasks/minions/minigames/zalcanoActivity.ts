import { randInt } from 'e';
import { Task } from 'klasa';
import { Bank, Misc } from 'oldschooljs';

import { Events } from '../../../lib/constants';
import { MinigameIDsEnum } from '../../../lib/minions/data/minigames';
import { ZalcanoActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run({
		channelID,
		quantity,
		duration,
		userID,
		performance,
		isMVP
	}: ZalcanoActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		user.incrementMinigameScore(MinigameIDsEnum.Zalcano, quantity);

		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			loot.add(
				Misc.Zalcano.kill({
					team: [{ isMVP, performancePercentage: performance, id: '1' }]
				})['1']
			);
		}

		const kc = user.getMinigameScore(MinigameIDsEnum.Zalcano);

		if (loot.amount('Smolcano') > 0) {
			this.client.emit(
				Events.ServerNotification,
				`**${user.username}'s** minion, ${
					user.minionName
				}, just received **Smolcano**, their Zalcano KC is ${randInt(
					kc || 1,
					(kc || 1) + quantity
				)}!`
			);
		}

		await user.addItemsToBank(loot.bank, true);

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot.bank,
				`Loot From ${quantity}x Zalcano`,
				true,
				{ showNewCL: 1 },
				user
			);

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${
				user.minionName
			} finished killing ${quantity}x Zalcano. Your Zalcano KC is now ${kc + quantity}`,
			res => {
				user.log(`continued zalcano`);
				return this.client.commands.get('zalcano')!.run(res, []);
			},
			image
		);
	}
}
