import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import { resolveNameBank } from 'oldschooljs/dist/util';

import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { AlchingActivityTaskOptions } from '../../lib/types/minions';
import { addArrayOfNumbers, roll, updateGPTrackSetting } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';

const bryophytasStaffId = itemID("Bryophyta's staff");

export default class extends Task {
	async run(data: AlchingActivityTaskOptions) {
		let { alchedBank, favorites, quantity, channelID, alchValue, userID, duration } = data;
		const user = await this.client.fetchUser(userID);
		const loot = new Bank({ Coins: alchValue });

		const parsedBank = new Bank(alchedBank);

		const casts = quantity ?? addArrayOfNumbers(parsedBank.items().map(i => i[1]));

		// If bryophyta's staff is equipped when starting the alch activity
		// calculate how many runes have been saved
		let savedRunes = 0;
		if (user.hasItemEquippedAnywhere(bryophytasStaffId)) {
			for (let i = 0; i < casts; i++) {
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
		updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceAlching, alchValue);

		const xpReceived = casts * 65;
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Magic,
			amount: xpReceived,
			duration
		});

		const saved = savedRunes > 0 ? `Your Bryophyta's staff saved you ${savedRunes} Nature runes.` : '';
		let responses =
			`${user}, ${user.minionName} has finished alching ${parsedBank}!\n${loot} has been added to your bank.\n${xpRes}\n${saved}`.trim();

		handleTripFinish(
			this.client,
			user,
			channelID,
			responses,
			res => {
				user.log(`continued trip of alching ${parsedBank}`);
				return this.client.commands.get('alch')!.run(res, [
					quantity,
					favorites
						? ''
						: parsedBank
								.items()
								.map(i => `${i[1]} ${i[0].name}`)
								.join(', ')
								.toLowerCase(),
					true
				]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
