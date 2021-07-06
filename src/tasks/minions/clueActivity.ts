import { Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Activity, Events } from '../../lib/constants';
import clueTiers from '../../lib/minions/data/clueTiers';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { addItemToBank, itemID, rand, roll } from '../../lib/util';
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

const tierGlobetrotterPiece: Record<string, number[]> = {
	Beginner: [itemID('Globetrotter message (beginner)'), itemID('Globetrotter headress'), 6_000],
	Easy: [itemID('Globetrotter message (easy)'), itemID('Globetrotter top'), 5_000],
	Medium: [itemID('Globetrotter message (medium)'), itemID('Globetrotter legs'), 4_000],
	Hard: [itemID('Globetrotter message (hard)'), itemID('Globetrotter gloves'), 3_000],
	Elite: [itemID('Globetrotter message (elite)'), itemID('Globetrotter boots'), 2_000],
	Master: [itemID('Globetrotter message (master)'), itemID('Globetrotter backpack'), 1_000]
};

export default class extends Task {
	async run(data: ClueActivityTaskOptions) {
		const { clueID, userID, channelID, quantity, duration } = data;
		const clueTier = clueTiers.find(mon => mon.id === clueID);
		const user = await this.client.users.fetch(userID);

		const logInfo = `ClueID[${clueID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}]`;

		if (!clueTier) {
			this.client.emit(Events.Wtf, `Missing user or clue - ${logInfo}`);
			return;
		}

		const numberOfMinutes = Math.floor(duration / Time.Minute);
		let loot = new Bank({ [clueTier.id]: quantity });
		let ticketStr = '';

		// Detects if user has the outfit piece for this tier already
		const clBank = new Bank(user.collectionLog);
		if (!clBank.has({ [tierGlobetrotterPiece[clueTier.name][1]]: 1 })) {
			// Check if the user has enough clues done and opened for this
			if (
				clBank.amount(clueTier.id) >= tierGlobetrotterPiece[clueTier.name][2] &&
				(user.settings.get(UserSettings.ClueScores)[clueTier.id] ?? 0) >=
					tierGlobetrotterPiece[clueTier.name][2]
			) {
				const ticketsToCheck = new Bank();
				Object.values(tierGlobetrotterPiece).forEach(value => {
					ticketsToCheck.add(value[0]);
				});
				// Check if the user has the ticket already in the bank, if not, calculates the chance to receive it
				// based on the trip length and the user max trip length
				if (
					ticketsToCheck.length === ticketsToCheck.remove(user.bank()).length &&
					roll(Math.max(3, user.maxTripLength(Activity.ClueCompletion) / Time.Minute - numberOfMinutes))
				) {
					loot.add(tierGlobetrotterPiece[clueTier.name][0]);
					ticketStr = ` As you clean the buried casket${
						quantity > 1 ? 's' : ''
					}, you find a strange message glued to one of them. Maybe you can examine the message further?`;
				}
			}
		}

		let str = `${user}, ${user.minionName} finished completing ${quantity} ${clueTier.name} clues. ${
			user.minionName
		} carefully places the reward casket${
			quantity > 1 ? 's' : ''
		} in your bank. You can open this casket using \`=open ${clueTier.name}\`.${ticketStr}`;

		if (user.equippedPet() === itemID('Zippy') && duration > Time.Minute * 5) {
			let bonusLoot = {};

			for (let i = 0; i < numberOfMinutes / rand(5, 10); i++) {
				const item = possibleFound.roll().items()[0][0].id;
				bonusLoot = addItemToBank(bonusLoot, item);
			}
			loot.add(bonusLoot);
			if (roll(15)) {
				loot.multiply(2);
				str += '\nZippy has **doubled** your loot.';
			}
			str += `\n\nZippy has found these items for you: ${new Bank(bonusLoot)}`;
		}

		await user.addItemsToBank(loot, true);

		this.client.emit(
			Events.Log,
			`${user.username}[${user.id}] received ${quantity} ${clueTier.name} Clue Caskets.`
		);

		handleTripFinish(this.client, user, channelID, str, undefined, undefined, data, loot.bank);
	}
}
