import { Time, randInt, roll } from 'e';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { ClueTiers } from '../../lib/clues/clueTiers';
import type { ClueActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

const possibleFound = new LootTable()
	.add('Reward casket (beginner)')
	.add('Reward casket (beginner)')
	.add('Reward casket (beginner)')
	.add('Reward casket (easy)')
	.add('Reward casket (easy)')
	.add('Reward casket (easy)')
	.add('Reward casket (medium)')
	.add('Reward casket (medium)')
	.add('Reward casket (hard)')
	.add('Reward casket (elite)')
	.add('Reward casket (master)')
	.add('Tradeable Mystery Box')
	.add('Tradeable Mystery Box')
	.add('Untradeable Mystery Box');

export const clueTask: MinionTask = {
	type: 'ClueCompletion',
	async run(data: ClueActivityTaskOptions) {
		const { clueID, userID, channelID, quantity, duration } = data;
		const clueTier = ClueTiers.find(mon => mon.id === clueID)!;
		const user = await mUserFetch(userID);

		let str = `${user.mention}, ${user.minionName} finished completing ${quantity} ${clueTier.name} clues.`;

		const loot = new Bank().add(clueTier.id, quantity);

		if (user.usingPet('Zippy') && duration > Time.Minute * 5) {
			const bonusLoot = new Bank();
			const numberOfMinutes = Math.floor(duration / Time.Minute);

			for (let i = 0; i < numberOfMinutes / randInt(5, 10); i++) {
				const item = possibleFound.roll().items()[0][0].id;
				bonusLoot.add(item);
			}

			loot.add(bonusLoot);

			if (roll(15)) {
				loot.multiply(2);
				str += '\nZippy has **doubled** your loot.';
			}

			str += '\n\nZippy has found items for you.';
		}
		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		str += `\n\nYou received: ${loot}.`;

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
