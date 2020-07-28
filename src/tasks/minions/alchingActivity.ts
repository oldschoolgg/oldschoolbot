import { AlchingActivityTaskOptions } from '../../lib/types/minions';
import { KlasaMessage, Task } from 'klasa';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { resolveNameBank, toKMB } from 'oldschooljs/dist/util';
import { noOp, roll, saidYes } from '../../lib/util';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { Time } from '../../lib/constants';
import hasItemEquipped from '../../lib/gear/functions/hasItemEquipped';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import getOSItem from '../../lib/util/getOSItem';

const { id: bryophytasStaffId } = getOSItem("Bryophyta's staff");

export default class extends Task {
	async run({ itemName, quantity, channelID, alchValue, userID }: AlchingActivityTaskOptions) {
		let savedRunes = 0;
		const user = await this.client.users.fetch(userID);
		await user.addGP(alchValue);

		// If bryophyta's staff is equipped when starting the alch activity
		// calculate how many runes have been saved
		if (hasItemEquipped(bryophytasStaffId, user.settings.get(UserSettings.Gear.Skilling))) {
			for (let i = 0; i < quantity; i++) {
				if (roll(15)) savedRunes++;
			}

			if (savedRunes > 0) {
				const returnedRunes = resolveNameBank({
					'Nature rune': savedRunes
				});

				user.addItemsToBank(returnedRunes);
			}
		}

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		const responses = [
			`${user}, ${
				user.minionName
			} has finished alching ${quantity}x ${itemName}! ${alchValue.toLocaleString()}gp (${toKMB(
				alchValue
			)}) has been added to your bank`,
			savedRunes > 0 ? `Your Bryophyta's staff saved you ${savedRunes} Nature runes` : '',
			`${user.minionName} asks if you'd like them to do another of the same trip.`
		];

		this.client.queuePromise(() => {
			channel.send(responses.join('. '));
			channel
				.awaitMessages(mes => mes.author === user && saidYes(mes.content), {
					time: getUsersPerkTier(user) > 1 ? Time.Minute * 10 : Time.Minute * 2,
					max: 1
				})
				.then(messages => {
					const response = messages.first();

					if (response && !response.author.minionIsBusy) {
						user.log(`continued trip of alching ${quantity}x ${itemName}`);
						this.client.commands
							.get('alch')!
							.run(response as KlasaMessage, [quantity, itemName]);
					}
				})
				.catch(noOp);
		});
	}
}
