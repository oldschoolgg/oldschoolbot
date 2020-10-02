import { Task } from 'klasa';

import { Armours } from '../../../../commands/Minion/warriorsguild';
import { AnimatedArmourActivityTaskOptions } from '../../../../lib/types/minions';
import { noOp, roll } from '../../../../lib/util';
import { channelIsSendable } from '../../../../lib/util/channelIsSendable';
import itemID from '../../../../lib/util/itemID';

export default class extends Task {
	async run({
		armourID,
		userID,
		channelID,
		quantity,
		duration
	}: AnimatedArmourActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const channel = await this.client.channels.fetch(channelID).catch(noOp);
		const armour = Armours.find(armour => armour.name === armourID);
		let str = '';

		if (!armour) {
			throw `WTF!`;
		}

		const fullhelm = armour.name.concat(' full helm');
		const platelegs = armour.name.concat(' platelegs');
		const platebody = armour.name.concat(' platebody');

		if (armour.breakChance1) {
			let killsBeforeBreak = 0;
			for (let i = 0; i < quantity; i++) {
				if (roll(armour.breakChance1)) {
					break;
				}
				killsBeforeBreak++;
			}
			if (killsBeforeBreak !== quantity) {
				str = `${user}, ${user.minionName} finished killing ${killsBeforeBreak}x animated ${
					armour.name
				} armour before a armour piece broke and received ${killsBeforeBreak *
					armour.tokens}x Warrior guild tokens.`;
				const loot = {
					8851: killsBeforeBreak * armour.tokens
				};

				await user.addItemsToBank(loot, true);

				str += `\nRemoved the following broken armour from bank: `;
				if (armour.name === 'bronze') {
					str += platebody;
					await user.removeItemFromBank(itemID(platebody), 1);
				}
				if (armour.name === 'iron') {
					str += platelegs;
					await user.removeItemFromBank(itemID(platelegs), 1);
				}
				if (armour.name === 'steel') {
					str += fullhelm;
					await user.removeItemFromBank(itemID(fullhelm), 1);
				}
				if (armour.breakChance3) {
					if (roll(armour.breakChance3)) {
						str += `, ${fullhelm}`;
						await user.removeItemFromBank(itemID(fullhelm), 1);
					}
					if (roll(armour.breakChance2)) {
						str += `, ${platelegs}`;
						await user.removeItemFromBank(itemID(platelegs), 1);
					}
				}
			} else {
				str = `${user}, ${user.minionName} finished killing ${quantity}x animated ${
					armour.name
				} armour and received ${killsBeforeBreak * armour.tokens}x Warrior guild tokens.`;
				const loot = {
					8851: killsBeforeBreak * armour.tokens
				};

				await user.addItemsToBank(loot, true);
			}
		} else {
			str = `${user}, ${user.minionName} finished killing ${quantity}x animated ${
				armour.name
			} armour and received ${quantity * armour.tokens}x Warrior guild tokens.`;
			const loot = {
				8851: quantity * armour.tokens
			};

			await user.addItemsToBank(loot, true);
		}

		// TODO: Combat calculations in future depending on HP

		if (!channelIsSendable(channel)) return;

		return channel.send(str);
	}
}
