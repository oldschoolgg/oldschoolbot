import { percentChance, randArrItem } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { ActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: ActivityTaskOptions) {
		let { userID, channelID } = data;
		const user = await this.client.users.fetch(userID);

		let str = '';
		let loot: Bank | undefined = undefined;
		if (percentChance(70)) {
			const deathReason = randArrItem([
				'Died to Porazdir.',
				'Killed by Derwen.',
				'Killed by Justiciar Zachariah.',
				`PK'd by a clan.`,
				'Killed by Chaos Elemental.',
				`Killed by a PKer.`
			]);
			str = `${user}, ${user.minionName} failed to complete the Mage Arena II: ${deathReason}. Try again.`;
		} else {
			loot = new Bank()
				.add('Imbued saradomin cape')
				.add('Imbued zamorak cape')
				.add('Imbued guthix cape');

			await user.addItemsToBank(loot, true);
			str = `${user}, ${user.minionName} finished the Mage Arena II, you received: ${loot}.`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			undefined,
			undefined,
			data,
			loot?.bank ?? null
		);
	}
}
