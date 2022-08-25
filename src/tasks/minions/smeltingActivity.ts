import { randInt } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { SmeltingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';

export default class extends Task {
	async run(data: SmeltingActivityTaskOptions) {
		let { barID, quantity, userID, channelID, duration, blastf } = data;
		const user = await this.client.fetchUser(userID);

		const bar = Smithing.Bars.find(bar => bar.id === barID)!;

		// If this bar has a chance of failing to smelt, calculate that here.
		const oldQuantity = quantity;
		if ((bar.chanceOfFail > 0 && bar.name !== 'Iron bar') || (!blastf && bar.name === 'Iron bar')) {
			let newQuantity = 0;
			for (let i = 0; i < quantity; i++) {
				if (randInt(0, 100) > bar.chanceOfFail) {
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

		const loot = new Bank({
			[bar.id]: quantity
		});

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(
			user,
			channelID,
			str,
			[
				'smelt',
				{
					name: bar.name,
					quantity: oldQuantity,
					blast_furnace: blastf
				},
				true
			],
			undefined,
			data,
			loot
		);
	}
}
