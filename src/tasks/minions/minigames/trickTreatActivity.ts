import { randArrItem } from 'e';
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
	.add('Purple sweets', [1, 5])
	.add('Chocolate bar')
	.add('Chocolate bomb')
	.add('Chocchip crunchies')
	.add('Chocolate strawberry')
	.tertiary(5, 'Pumpkin');

export default class extends Task {
	async run({ channelID, quantity, duration, userID }: SepulchreActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		user.incrementMinigameScore(MinigameIDsEnum.TrickOrTreat, quantity);

		const loot = new Bank();
		loot.add(trickOrTreatingLootTable.roll());

		if (roll(20)) {
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

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot.bank,
				`Loot From Trick or Treating!`,
				true,
				{ showNewCL: 1 },
				user
			);

		handleTripFinish(
			this.client,
			user,
			channelID,
			`You finished Trick or Treating!`,
			res => {
				user.log(`continued trick or treating`);
				return this.client.commands.get('trickortreat')!.run(res, []);
			},
			image
		);
	}
}
