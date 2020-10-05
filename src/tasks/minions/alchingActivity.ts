import { Task } from 'klasa';
import { resolveNameBank, toKMB } from 'oldschooljs/dist/util';

import hasItemEquipped from '../../lib/gear/functions/hasItemEquipped';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { AlchingActivityTaskOptions } from '../../lib/types/minions';
import { roll } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';

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

		const saved =
			savedRunes > 0 ? `Your Bryophyta's staff saved you ${savedRunes} Nature runes.` : '';
		const responses = [
			`${user}, ${user.minionName} has finished alching ${quantity}x ${
				item.name
			}! ${alchValue.toLocaleString()}gp (${toKMB(
				alchValue
			)}) has been added to your bank. ${saved}`
		];

		handleTripFinish(
			this.client,
			user,
			channelID,
			responses.join('\n'),
			undefined,
			undefined,
			res => {
				user.log(`continued trip of alching ${quantity}x ${item.name}`);
				return this.client.commands.get('alch')!.run(res, [quantity, [item]]);
			}
		);
	}
}
