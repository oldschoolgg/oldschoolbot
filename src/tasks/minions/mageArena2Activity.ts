import { percentChance, randArrItem } from 'e';
import { Bank } from 'oldschooljs';

import type { ActivityTaskOptionsWithNoChanges } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const mageArenaTwoTask: MinionTask = {
	type: 'MageArena2',
	async run(data: ActivityTaskOptionsWithNoChanges) {
		const { userID, channelID } = data;
		const user = await mUserFetch(userID);

		let str = '';
		let loot: Bank | undefined = undefined;
		if (percentChance(70)) {
			const deathReason = randArrItem([
				'Died to Porazdir',
				'Killed by Derwen',
				'Killed by Justiciar Zachariah',
				"PK'd by a clan",
				'Killed by Chaos Elemental',
				'Killed by a PKer'
			]);
			str = `${user}, ${user.minionName} failed to complete the Mage Arena II: ${deathReason}. Try again.`;
		} else {
			loot = new Bank().add('Imbued saradomin cape').add('Imbued zamorak cape').add('Imbued guthix cape');

			await transactItems({
				userID: user.id,
				collectionLog: true,
				itemsToAdd: loot
			});
			str = `${user}, ${user.minionName} finished the Mage Arena II, you received: ${loot}.`;
		}

		handleTripFinish(user, channelID, str, undefined, data, loot ?? null);
	}
};
