import { KlasaMessage, Task } from 'klasa';
import { Bank } from 'oldschooljs';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import CastleWarsCommand from '../../../commands/Minion/castlewars';
import { getMinionName, incrementMinigameScore } from '../../../lib/settings/settings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

const ticketTable = new SimpleTable<number>().add(1, 4).add(2, 4).add(3, 1);

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, userID } = data;

		incrementMinigameScore(userID, 'CastleWars', quantity);

		const minionName = await getMinionName(userID);

		const user = await this.client.fetchUser(userID);
		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			loot.add('Castle wars ticket', ticketTable.roll().item);
		}
		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			`<@${userID}>, ${minionName} finished ${quantity}x Castle Wars games and received ${loot}.`,
			res => {
				user.log('continued castle wars');
				return (this.client.commands.get('castlewars') as unknown as CastleWarsCommand)!.play(
					res
				) as Promise<KlasaMessage>;
			},
			undefined,
			data,
			loot.bank
		);
	}
}
