import { Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { SkillsEnum } from '../../lib/skilling/types';
import { AlchingActivityTaskOptions } from '../../lib/types/minions';
import { itemID, roll } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

const bryophytasStaffId = itemID("Bryophyta's staff");

export default class extends Task {
	async run(data: AlchingActivityTaskOptions) {
		let { itemID, quantity, channelID, alchValue, userID, duration } = data;
		const user = await this.client.users.fetch(userID);
		await user.incrementMinionDailyDuration(duration);
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

		if (duration > Time.Minute * 20 && roll(Math.ceil(8000 / (duration / Time.Minute)))) {
			loot.add('Lil lamb');
		}

		await user.addItemsToBank(loot, true);

		const xpReceived = quantity * 65;
		const xpRes = await user.addXP(SkillsEnum.Magic, xpReceived, duration);

		const saved =
			savedRunes > 0 ? `Your Bryophyta's staff saved you ${savedRunes} Nature runes.` : '';
		let responses = [
			`${user}, ${user.minionName} has finished alching ${quantity}x ${item.name}! ${loot} has been added to your bank. ${xpRes}. ${saved}`
		].join('\n');

		if (loot.has('Lil Lamb')) {
			responses += `<:lil_lamb:749240864345423903> While standing at the bank alching, a small lamb, abandoned by its family, licks your minions hand. Your minion adopts the lamb.`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			responses,
			res => {
				user.log(`continued trip of alching ${quantity}x ${item.name}`);
				return this.client.commands.get('alch')!.run(res, [quantity, [item]]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
