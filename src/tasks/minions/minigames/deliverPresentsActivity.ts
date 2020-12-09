import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Emoji } from '../../../lib/constants';
import { MinigameIDsEnum } from '../../../lib/minions/data/minigames';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SepulchreActivityTaskOptions } from '../../../lib/types/minions';
import { roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

const deliverPresentsLootTable = new LootTable()
	.every('Purple sweets', [1, 3])
	.every('Chocolate bar')
	.add('Purple sweets', [1, 5])
	.add('Chocolate bar')
	.add('Chocolate bomb')
	.add('Chocchip crunchies')
	.add('Chocolate strawberry')
	.add('Crackers', [2, 5])
	.add('Bucket of milk')
	.add('Carrot')
	.tertiary(5000, 'Coal');

export default class extends Task {
	async run({ channelID, quantity, duration, userID }: SepulchreActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		user.incrementMinigameScore(MinigameIDsEnum.DeliverPresents, quantity);

		const loot = new Bank();
		loot.add(deliverPresentsLootTable.roll());

		const collectionLog = new Bank(user.settings.get(UserSettings.CollectionLogBank));

		let str = `${user}, ${user.minionName} finished delivering presents, and picked up some goodies that kids left out for Santa.`;

		if (!collectionLog.has('Santa hat') && roll(2)) {
			loot.add('Santa hat');
			str += `${Emoji.SantaHat} ${user.minionName} found a Santa hat on the floor and took it.`;
		}

		const amountCrackers = collectionLog.amount('Christmas cracker');
		if (
			(amountCrackers === 0 && roll(2)) ||
			(amountCrackers === 1 && roll(30)) ||
			(amountCrackers === 2 && roll(250))
		) {
			loot.add('Christmas cracker');
			str += `${Emoji.ChristmasCracker} ${user.minionName} found a Christmas cracker on the floor and took it.`;
		}

		await user.addItemsToBank(loot.bank, true);

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot.bank,
				`Loot From Delivering Presents!`,
				true,
				{ showNewCL: 1 },
				user
			);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued delivering presents`);
				return this.client.commands.get('deliverpresents')!.run(res, []);
			},
			image
		);
	}
}
