import { Bank } from 'oldschooljs';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { incrementMinigameScore } from '../../../lib/settings/settings';
import { MinionTask } from '../../../lib/Task';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { mUserFetch } from '../../../mahoji/mahojiSettings';

const ticketTable = new SimpleTable<number>().add(1, 4).add(2, 4).add(3, 1);

export const castleWarsTask: MinionTask = {
	type: 'CastleWars',
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, userID } = data;

		incrementMinigameScore(userID, 'castle_wars', quantity);

		const user = await mUserFetch(userID);
		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			loot.add('Castle wars ticket', ticketTable.roll().item);
		}
		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(
			user,
			channelID,
			`${user.mention}, ${user.minionName} finished ${quantity}x Castle Wars games and received ${loot}.`,
			['minigames', { castle_wars: { start: {} } }, true, 'play'],
			undefined,
			data,
			loot
		);
	}
};
