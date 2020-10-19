import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { MinigameIDsEnum } from '../../../lib/minions/data/minigames';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SepulchreActivityTaskOptions } from '../../../lib/types/minions';
import { roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

const trickOrTreatingLootTable = new LootTable()
	.every('Purple sweets', [1, 5])
	.every('Chocolate bar')
	.add('Purple sweets', [1, 5])
	.add('Chocolate bar')
	.add('Chocolate bomb')
	.add('Chocchip crunchies')
	.add('Chocolate strawberry')
	.tertiary(5, 'Pumpkin')
	.tertiary(5000, 'Coal');

export default class extends Task {
	async run({ channelID, quantity, duration, userID }: SepulchreActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		user.incrementMinigameScore(MinigameIDsEnum.TrickOrTreat, quantity);

		const loot = new Bank();
		loot.add(trickOrTreatingLootTable.roll());

		const collectionLog = new Bank(user.settings.get(UserSettings.CollectionLogBank));

		for (const mask of ['Green halloween mask', 'Red halloween mask', 'Blue halloween mask']) {
			if (roll(15) && collectionLog.amount(mask) === 0) {
				loot.add(mask);
			}
		}

		if (roll(500)) {
			loot.add('Cob');
		}

		await user.addItemsToBank(loot.bank, true);

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
			`${user}, ${user.minionName} finished Trick or Treating! ${
				loot.amount('Green halloween mask') > 0
					? `Your minion found some masks on the ground and picked them up.`
					: ''
			}`,
			res => {
				user.log(`continued trick or treating`);
				return this.client.commands.get('trickortreat')!.run(res, []);
			},
			image
		);
	}
}
