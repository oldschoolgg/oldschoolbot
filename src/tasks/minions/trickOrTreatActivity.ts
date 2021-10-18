import { randArrItem, roll } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { treatTable } from '../../lib/simulation/pumpkinHead';
import { TrickOrTreatOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: TrickOrTreatOptions) {
		const { userID, channelID, rolls } = data;
		const user = await this.client.fetchUser(userID);

		const loot = new Bank();
		for (let i = 0; i < rolls; i++) {
			loot.add(treatTable.roll());
		}

		let str = `${user}, ${user.minionName} finished Trick or Treating! You received: ${loot}.`;

		if (roll(20)) {
			const item = randArrItem(loot.items());
			str += `\n\n**I wonder if anything would like to eat '${item[0].name}'?**`;
		} else if (roll(40)) {
			str += '\n\n**I wonder what I can use this treats for? They look disgusting, but I better save them.**';
		}

		const { previousCL, itemsAdded } = await user.addItemsToBank(loot, true);
		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(itemsAdded, 'Loot From Trick Or Treating', true, { showNewCL: 1 }, user, previousCL);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log('continued trip of t-o-t');
				return this.client.commands.get('trickortreat')!.run(res, []);
			},
			image!,
			data,
			loot.bank
		);
	}
}
