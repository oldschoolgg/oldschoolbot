import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { SkillsEnum } from '../../lib/skilling/types';
import { AlchingActivityTaskOptions } from '../../lib/types/minions';
import { roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';

const bryophytasStaffId = itemID("Bryophyta's staff");

export default class extends Task {
	async run(data: AlchingActivityTaskOptions) {
		let { alchBank, quantity, channelID, alchValue, userID, duration } = data;
		const user = await this.client.users.fetch(userID);
		const loot = new Bank({ Coins: alchValue });

		// Loses class/type info so reclass-ify it:
		// (My guess it that it loads from DB and doesn't 'new')
		alchBank = new Bank(alchBank.bank);

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
		await user.addItemsToBank(loot);

		const xpReceived = quantity * 65;
		const xpRes = await user.addXP(SkillsEnum.Magic, xpReceived, duration);

		const saved =
			savedRunes > 0 ? `Your Bryophyta's staff saved you ${savedRunes} Nature runes.` : '';
		let responses = [
			`${user}, ${user.minionName} has finished alching ${alchBank}! ${loot} has been added to your bank. ${xpRes}. ${saved}`
		].join('\n');

		handleTripFinish(
			this.client,
			user,
			channelID,
			responses,
			res => {
				user.log(`continued trip of alching ${alchBank.toString()}`);
				return this.client.commands.get('alch')!.run(res, [[alchBank]]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
