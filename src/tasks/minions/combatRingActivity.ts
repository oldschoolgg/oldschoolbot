import { Bank } from 'oldschooljs';

import type { ActivityTaskOptionsWithNoChanges } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const combatRingTask: MinionTask = {
	type: 'CombatRing',
	async run(data: ActivityTaskOptionsWithNoChanges) {
		const { channelID, userID } = data;
		const user = await mUserFetch(userID);

		const loot = new Bank({
			'Shayzien boots (1)': 1,
			'Shayzien gloves (1)': 1,
			'Shayzien greaves (1)': 1,
			'Shayzien helm (1)': 1,
			'Shayzien platebody (1)': 1,
			'Shayzien boots (2)': 1,
			'Shayzien gloves (2)': 1,
			'Shayzien greaves (2)': 1,
			'Shayzien helm (2)': 1,
			'Shayzien platebody (2)': 1,
			'Shayzien boots (3)': 1,
			'Shayzien gloves (3)': 1,
			'Shayzien greaves (3)': 1,
			'Shayzien helm (3)': 1,
			'Shayzien platebody (3)': 1,
			'Shayzien boots (4)': 1,
			'Shayzien gloves (4)': 1,
			'Shayzien greaves (4)': 1,
			'Shayzien helm (4)': 1,
			'Shayzien platebody (4)': 1,
			'Shayzien boots (5)': 1,
			'Shayzien gloves (5)': 1,
			'Shayzien greaves (5)': 1,
			'Shayzien helm (5)': 1,
			'Shayzien body (5)': 1
		});

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished the Combat Ring, and received ${loot}.`,
			undefined,
			data,
			loot
		);
	}
};
