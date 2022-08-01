import { Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { MIN_LENGTH_FOR_PET } from '../../lib/constants';
import { SkillsEnum } from '../../lib/skilling/types';
import { AlchingActivityTaskOptions } from '../../lib/types/minions';
import { roll, updateGPTrackSetting } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: AlchingActivityTaskOptions) {
		let { itemID, quantity, channelID, alchValue, userID, duration } = data;
		const user = await this.client.fetchUser(userID);
		const loot = new Bank({ Coins: alchValue });

		const item = getOSItem(itemID);

		// If bryophyta's staff is equipped when starting the alch activity
		// calculate how many runes have been saved
		let savedRunes = 0;
		const hasImbuedStaff = user.hasItemEquippedAnywhere("Bryophyta's staff(i)");
		const hasStaff = user.hasItemEquippedAnywhere("Bryophyta's staff");
		if (hasImbuedStaff || hasStaff) {
			for (let i = 0; i < quantity; i++) {
				if (roll(hasImbuedStaff ? 7 : 15)) savedRunes++;
			}

			if (savedRunes > 0) {
				const returnedRunes = resolveNameBank({
					'Nature rune': savedRunes
				});

				loot.add(returnedRunes);
			}
		}

		if (duration > MIN_LENGTH_FOR_PET && roll(Math.ceil(8000 / (duration / Time.Minute)))) {
			loot.add('Lil lamb');
		}

		await user.addItemsToBank({ items: loot, collectionLog: true });
		updateGPTrackSetting('gp_alch', alchValue);

		const xpReceived = quantity * 65;
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Magic,
			amount: xpReceived,
			duration
		});

		const saved = savedRunes > 0 ? `Your Bryophyta's staff saved you ${savedRunes} Nature runes.` : '';
		let responses = [
			`${user}, ${user.minionName} has finished alching ${quantity}x ${item.name}! ${loot} has been added to your bank. ${xpRes}. ${saved}`
		].join('\n');

		if (loot.has('Lil Lamb')) {
			responses +=
				'<:lil_lamb:749240864345423903> While standing at the bank alching, a small lamb, abandoned by its family, licks your minions hand. Your minion adopts the lamb.';
		}

		handleTripFinish(
			user,
			channelID,
			responses,
			['activities', { alch: { quantity, item: item.name } }, true],
			undefined,
			data,
			loot
		);
	}
}
