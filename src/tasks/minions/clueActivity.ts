import { Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { clueHunterOutfit } from '../../commands/Minion/mclue';
import { Events } from '../../lib/constants';
import clueTiers from '../../lib/minions/data/clueTiers';
import { ClueActivityTaskOptions } from '../../lib/types/minions';
import { addBanks, addItemToBank, itemID, multiplyBank, rand, roll } from '../../lib/util';
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
		} in your bank. You can open this casket using \`=open ${clueTier.name}\``;

		let loot = { [clueTier.id]: quantity };

		if (user.equippedPet() === itemID('Zippy') && duration > Time.Minute * 5) {
			let bonusLoot = {};
			const numberOfMinutes = Math.floor(duration / Time.Minute);
			let zippyRolls = rand(5, 10);
			if (user.hasItemEquippedAnywhere(clueHunterOutfit, true)) {
				zippyRolls /= 2;
			}
			if (user.hasGracefulEquipped()) {
				zippyRolls *= 0.9;
			}
			if (user.hasItemEquippedAnywhere(['Achievement diary cape', 'Achievement diary cape(t)'], false)) {
				zippyRolls *= 0.9;
			}
			zippyRolls = Math.max(2, Math.floor(zippyRolls));
			// Allow clue buffs to affect zippy rolls. Cant get below 2
			for (let i = 0; i < numberOfMinutes / zippyRolls; i++) {
				const item = possibleFound.roll().items()[0][0].id;
				bonusLoot = addItemToBank(bonusLoot, item);
			}

			loot = addBanks([loot, bonusLoot]);

			if (roll(15)) {
				loot = multiplyBank(loot, 2);
				str += '\nZippy has **doubled** your loot.';
			}

			str += `\n\nZippy has found these items for you: ${new Bank(bonusLoot)}`;
		}
		await user.addItemsToBank(loot, true);

		this.client.emit(
			Events.Log,
			`${user.username}[${user.id}] received ${quantity} ${clueTier.name} Clue Caskets.`
		);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => this.client.commands.get('mclue')!.run(res, [quantity, clueTier.name]),
			undefined,
			data,
			loot
		);
	}
}
