import { randArrItem, randInt } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { MinigameIDsEnum } from '../../../lib/minions/data/minigames';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SepulchreActivityTaskOptions } from '../../../lib/types/minions';
import { roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import resolveItems from '../../../lib/util/resolveItems';

const trickOrTreatingLootTable = new LootTable()
	.every('Purple sweets', [1, 5])
	.every('Chocolate bar')
	.add('Chocolate strawberry')
	.add('Purple sweets', [1, 5])
	.add('Chocolate bar')
	.tertiary(5, 'Pumpkin');

export default class extends Task {
	async run({ channelID, quantity, duration, userID }: SepulchreActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		user.incrementMinigameScore(MinigameIDsEnum.TrickOrTreat, quantity);

		const loot = new Bank();
		loot.add(trickOrTreatingLootTable.roll());

		if (roll(20)) {
			const cl = new Bank(user.settings.get(UserSettings.CollectionLogBank));
			const masks = resolveItems([
				'Green halloween mask',
				'Red halloween mask',
				'Blue halloween mask'
			]);
			const collectionLog = new Bank(user.settings.get(UserSettings.CollectionLogBank));
			const notReceived = masks.filter(piece => collectionLog.amount(piece) === 0);

			if (notReceived.length > 0) {
				loot.add(randArrItem(notReceived));
			}
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x sepulchre`);
				return this.client.commands.get('sepulchre')!.run(res, []);
			},
			image
		);
	}
}
