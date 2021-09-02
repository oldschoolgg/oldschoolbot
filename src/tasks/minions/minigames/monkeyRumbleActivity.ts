import { KlasaMessage, Task } from 'klasa';
import { Bank } from 'oldschooljs';

import CastleWarsCommand from '../../../commands/Minion/castlewars';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { MonkeyRumbleOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MonkeyRumbleOptions) {
		const { channelID, quantity, userID } = data;

		incrementMinigameScore(userID, 'MadMarimbosMonkeyRumble', quantity);

		const user = await this.client.fetchUser(userID);
		const loot = new Bank();

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${user.minionName} finished ${quantity}x Castle Wars games and received ${loot}.`,
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
