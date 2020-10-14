import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { BitField } from '../../../lib/constants';
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

		const hasReceivedMasks = user.settings
			.get(UserSettings.BitField)
			.includes(BitField.HasReceivedHweenMasks);

		if (roll(1) && !hasReceivedMasks) {
			loot.add({
				'Green halloween mask': 1,
				'Red halloween mask': 1,
				'Blue halloween mask': 1
			});
			await user.settings.update(UserSettings.BitField, BitField.HasReceivedHweenMasks);
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
			`${user}, ${user.minionName} finished Trick or Treating!`,
			res => {
				user.log(`continued trick or treating`);
				return this.client.commands.get('trickortreat')!.run(res, []);
			},
			image
		);
	}
}
