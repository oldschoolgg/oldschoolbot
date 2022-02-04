import { randInt, Time } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { MIN_LENGTH_FOR_PET } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { SmeltingActivityTaskOptions } from '../../lib/types/minions';
import { roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';

export default class extends Task {
	async run(data: SmeltingActivityTaskOptions) {
		let { barID, quantity, userID, channelID, duration } = data;
		const user = await this.client.fetchUser(userID);

		const bar = Smithing.Bars.find(bar => bar.id === barID)!;

		// If this bar has a chance of failing to smelt, calculate that here.
		const masterCapeInEffect = bar.chanceOfFail > 0 && user.hasItemEquippedAnywhere('Smithing master cape');
		const oldQuantity = quantity;

		if (bar.chanceOfFail > 0) {
			let chance = masterCapeInEffect ? bar.chanceOfFail / 2 : bar.chanceOfFail;
			let newQuantity = 0;
			for (let i = 0; i < quantity; i++) {
				if (randInt(0, 100) > chance) {
					newQuantity++;
				}
			}
			quantity = newQuantity;
		}

		let xpReceived = quantity * bar.xp;

		if (bar.id === itemID('Gold bar') && user.hasItemEquippedAnywhere('Goldsmith gauntlets')) {
			xpReceived = quantity * 56.2;
		}

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Smithing,
			amount: xpReceived,
			duration
		});

		let str = `${user}, ${user.minionName} finished smelting ${quantity}x ${bar.name}. ${xpRes}`;

		if (bar.chanceOfFail > 0 && oldQuantity > quantity) {
			str += `\n\n${oldQuantity - quantity} ${bar.name}s failed to smelt.`;
		}

		if (masterCapeInEffect) {
			str += '\n2x less likely to fail from Smithing master cape';
		}

		const loot = new Bank({
			[bar.id]: quantity
		});

		if (duration >= MIN_LENGTH_FOR_PET) {
			const numMinutes = duration / Time.Minute;
			if (user.settings.get(UserSettings.QP) > 10) {
				for (let i = 0; i < numMinutes; i++) {
					if (roll(6500)) {
						str +=
							'\n\n<:zak:751035589952012298> While Smelting ores on Neitiznot, a Yak approaches you and says "Moooo". and is now following you around. You decide to name him \'Zak\'.';
						loot.add('Zak');
						break;
					}
				}
			}
		}

		await user.addItemsToBank({ items: loot, collectionLog: true });

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			[
				'smelt',
				{
					name: bar.name,
					quantity: oldQuantity
				},
				true
			],
			undefined,
			data,
			loot
		);
	}
}
