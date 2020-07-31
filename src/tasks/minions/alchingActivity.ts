import { AlchingActivityTaskOptions } from '../../lib/types/minions';
import { KlasaMessage, Task } from 'klasa';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { resolveNameBank, toKMB } from 'oldschooljs/dist/util';
import { noOp, roll, saidYes } from '../../lib/util';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { Time } from '../../lib/constants';
import hasItemEquipped from '../../lib/gear/functions/hasItemEquipped';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import itemID from '../../lib/util/itemID';
import getOSItem from '../../lib/util/getOSItem';

const bryophytasStaffId = itemID("Bryophyta's staff");

export default class extends Task {
	async run({
		itemID,
		quantity,
		channelID,
		alchValue,
		userID,
		duration
	}: AlchingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		await user.incrementMinionDailyDuration(duration);
		await user.addGP(alchValue);
		const item = getOSItem(itemID);

		// If bryophyta's staff is equipped when starting the alch activity
		// calculate how many runes have been saved
		let savedRunes = 0;
		if (hasItemEquipped(bryophytasStaffId, user.settings.get(UserSettings.Gear.Skilling))) {
			for (let i = 0; i < quantity; i++) {
				if (roll(15)) savedRunes++;
			}

			if (savedRunes > 0) {
				const returnedRunes = resolveNameBank({
					'Nature rune': savedRunes
				});

				await user.addItemsToBank(returnedRunes);
			}
		}

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		const saved =
			savedRunes > 0 ? `Your Bryophyta's staff saved you ${savedRunes} Nature runes.` : '';
		const responses = [
			`${user}, ${user.minionName} has finished alching ${quantity}x ${
				item.name
			}! ${alchValue.toLocaleString()}gp (${toKMB(
				alchValue
			)}) has been added to your bank. ${saved}`,
			`${user.minionName} asks if you'd like them to do another of the same trip.`
		];

		this.client.queuePromise(() => {
			channel.send(responses.join('\n'));
			channel
				.awaitMessages(mes => mes.author === user && saidYes(mes.content), {
					time: getUsersPerkTier(user) > 1 ? Time.Minute * 10 : Time.Minute * 2,
					max: 1
				})
				.then(messages => {
					const response = messages.first();

					if (response && !response.author.minionIsBusy) {
						user.log(`continued trip of alching ${quantity}x ${item.name}`);
						this.client.commands
							.get('alch')!
							.run(response as KlasaMessage, [quantity, [item]])
							.catch(err => channel.send(err));
					}
				})
				.catch(noOp);
		});
	}
}
