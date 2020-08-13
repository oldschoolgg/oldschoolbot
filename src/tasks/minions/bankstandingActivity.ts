import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp, roll, rand, multiplyBank } from '../../lib/util';
import { Time } from '../../lib/constants';
import { BankstandActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { Banks } from '../../commands/Minion/bankstand';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import itemID from '../../lib/util/itemID';

export default class extends Task {
	async run({ bankID, userID, channelID, duration }: BankstandActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);

		const bank = Banks.find(bank => bank === bankID);
		if (!bank) return;

		let str = `${user}, ${user.minionName} finished bankstanding at ${bank}. ${user.minionName} asks if you'd like them to do another of the same trip.`;

		let loot = {
			[itemID('Mystery box')]: rand(1, 4)
		};

		if (roll(1000)) {
			loot = multiplyBank(loot, 10);
			str += `\nJACKPOT 10 times the mystery boxes`;
		}

		if (roll(50)) {
			// Removes mystery boxes and gives 1 coal
			loot[itemID('Mystery box')] = 0;
			loot[453] = 1;
			str += `\nYou got scammed while standing at the bank`;
		}

		str += `\nYou received: ${await createReadableItemListFromBank(this.client, loot)}.`;

		await user.addItemsToBank(loot, true);

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		channel.send(str).catch(noOp);

		channel
			.awaitMessages(mes => mes.author === user && saidYes(mes.content), {
				time: getUsersPerkTier(user) > 1 ? Time.Minute * 10 : Time.Minute * 2,
				max: 1
			})
			.then(messages => {
				const response = messages.first();

				if (response) {
					if (response.author.minionIsBusy) return;

					user.log(`continued trip of ${bank}[${bankID}]`);

					this.client.commands.get('bankstand')!.run(response as KlasaMessage, [bank]);
				}
			})
			.catch(noOp);
	}
}
