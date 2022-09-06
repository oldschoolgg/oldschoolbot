import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { SkillsEnum } from '../../lib/skilling/types';
import { AlchingActivityTaskOptions } from '../../lib/types/minions';
import { roll } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';
import { updateGPTrackSetting } from '../../mahoji/mahojiSettings';

const bryophytasStaffId = itemID("Bryophyta's staff");

export default class extends Task {
	async run(data: AlchingActivityTaskOptions) {
		let { itemID, quantity, channelID, alchValue, userID, duration } = data;
		const user = await this.client.fetchUser(userID);
		const loot = new Bank({ Coins: alchValue });

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

				loot.add(returnedRunes);
			}
		}
		await user.addItemsToBank({ items: loot });
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
