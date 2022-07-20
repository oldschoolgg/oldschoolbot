import { Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { ClueTiers } from '../../lib/clues/clueTiers';
import { Events } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { addItemToBank, itemID, rand, roll, updateBankSetting } from '../../lib/util';
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
		const clueTier = ClueTiers.find(mon => mon.id === clueID);
		const user = await this.client.fetchUser(userID);

		const logInfo = `ClueID[${clueID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}]`;

		if (!clueTier) {
			this.client.emit(Events.Wtf, `Missing user or clue - ${logInfo}`);
			return;
		}

		let str = `${user}, ${user.minionName} finished completing ${quantity} ${clueTier.name} clues. ${
			user.minionName
		} carefully places the reward casket${
			quantity > 1 ? 's' : ''
		} in your bank. You can open this casket using \`/open name:${clueTier.name}\``;

		let loot = new Bank().add(clueTier.id, quantity);

		if (user.equippedPet() === itemID('Zippy') && duration > Time.Minute * 5) {
			let bonusLoot = {};
			const numberOfMinutes = Math.floor(duration / Time.Minute);

			for (let i = 0; i < numberOfMinutes / rand(5, 10); i++) {
				const item = possibleFound.roll().items()[0][0].id;
				bonusLoot = addItemToBank(bonusLoot, item);
			}

			await updateBankSetting(this.client, ClientSettings.EconomyStats.ZippyLoot, bonusLoot);

			loot.add(bonusLoot);

			if (roll(15)) {
				await updateBankSetting(this.client, ClientSettings.EconomyStats.ZippyLoot, loot);
				loot.multiply(2);
				str += '\nZippy has **doubled** your loot.';
			}

			str += `\n\nZippy has found these items for you: ${new Bank(bonusLoot)}`;
		}
		await user.addItemsToBank({ items: loot, collectionLog: true });

		handleTripFinish(user, channelID, str, ['clue', { tier: clueTier.name, quantity }], undefined, data, loot);
	}
}
