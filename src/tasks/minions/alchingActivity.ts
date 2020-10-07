import { Task } from 'klasa';
import { resolveNameBank, toKMB } from 'oldschooljs/dist/util';

import { Time } from '../../lib/constants';
import { AlchingActivityTaskOptions } from '../../lib/types/minions';
import { itemID, roll } from '../../lib/util';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

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
		if (user.hasItemEquippedAnywhere(bryophytasStaffId)) {
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

		let gotLamb = false;
		if (duration > Time.Minute * 20 && roll(200)) {
			gotLamb = true;
			user.addItemsToBank({ 9619: 1 });
		}

		const saved =
			savedRunes > 0 ? `Your Bryophyta's staff saved you ${savedRunes} Nature runes.` : '';
		const responses = [
			`${user}, ${user.minionName} has finished alching ${quantity}x ${
				item.name
			}! ${alchValue.toLocaleString()}gp (${toKMB(
				alchValue
			)}) has been added to your bank. ${saved}`
		];
		if (gotLamb) {
			responses.push(
				`<:lil_lamb:749240864345423903> While standing at the bank alching, a small lamb, abandoned by its family, licks your minions hand. Your minion adopts the lamb.`
			);
		}

		handleTripFinish(this.client, user, channelID, responses.join('\n'), res => {
			user.log(`continued trip of alching ${quantity}x ${item.name}`);
			return this.client.commands.get('alch')!.run(res, [quantity, [item]]);
		});
	}
}
