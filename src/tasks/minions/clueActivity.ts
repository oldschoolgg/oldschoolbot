import { Task } from 'klasa';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Events, Time } from '../../lib/constants';
import { getRandomMysteryBox } from '../../lib/data/openables';
import clueTiers from '../../lib/minions/data/clueTiers';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { addBanks, addItemToBank, itemID, multiplyBank, rand, roll } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
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

export default class extends Task {
	async run(data: ClueActivityTaskOptions) {
		const { clueID, userID, channelID, quantity, duration } = data;
		const clueTier = clueTiers.find(mon => mon.id === clueID);
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);

		const logInfo = `ClueID[${clueID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}]`;

		if (!clueTier) {
			this.client.emit(Events.Wtf, `Missing user or clue - ${logInfo}`);
			return;
		}

		let str = `${user}, ${user.minionName} finished completing ${quantity} ${
			clueTier.name
		} clues. ${user.minionName} carefully places the reward casket${
			quantity > 1 ? 's' : ''
		} in your bank. You can open this casket using \`=open ${clueTier.name}\``;

		let loot = { [clueTier.id]: quantity };
		if (duration > Time.Minute * 20 && roll(10)) {
			loot = multiplyBank(loot, 2);
			loot[getRandomMysteryBox()] = 1;
		}

		if (user.equippedPet() === itemID('Zippy') && duration > Time.Minute * 5) {
			let bonusLoot = {};
			const numberOfMinutes = Math.floor(duration / Time.Minute);

			for (let i = 0; i < numberOfMinutes / rand(5, 10); i++) {
				const { item } = possibleFound.roll()[0];
				bonusLoot = addItemToBank(bonusLoot, item);
			}

			loot = addBanks([loot, bonusLoot]);

			if (roll(15)) {
				loot = multiplyBank(loot, 2);
				str += `\nZippy has **doubled** your loot.`;
			}

			str += `\n\nZippy has found these items for you: ${await createReadableItemListFromBank(
				this.client,
				bonusLoot
			)}`;
		}
		await user.addItemsToBank(loot, true);

		this.client.emit(
			Events.Log,
			`${user.username}[${user.id}] received ${quantity} ${clueTier.name} Clue Caskets.`
		);

		handleTripFinish(this.client, user, channelID, str, undefined, undefined, data);
	}
}
