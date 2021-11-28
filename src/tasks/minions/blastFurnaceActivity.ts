import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { hasBlackSmithEquipped } from '../../commands/Minion/smith';
import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { BlastFurnaceActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';

export default class extends Task {
	async run(data: BlastFurnaceActivityTaskOptions) {
		let { barID, quantity, userID, channelID, duration } = data;
		const user = await this.client.fetchUser(userID);

		const bar = Smithing.BlastableBars.find(bar => bar.id === barID)!;

		let xpReceived = quantity * bar.xp;

		const hasBS = hasBlackSmithEquipped(user.getGear('skilling'));

		if (bar.id === itemID('Gold bar') && user.hasItemEquippedOrInBank('Goldsmith gauntlets')) {
			xpReceived = quantity * 56.2;
		}

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Smithing,
			amount: xpReceived * (hasBS ? 1.1 : 1),
			duration
		});

		let str = `${user}, ${user.minionName} finished smelting ${quantity}x ${
			bar.name
		} at the Blast Furnace. ${xpRes}${hasBS ? '\n10% more XP for having the blacksmith outfit equipped' : ''}`;

		const loot = new Bank({
			[bar.id]: quantity
		});

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			['blastfurnace', [quantity, bar.name], true],
			undefined,
			data,
			loot.bank
		);
	}
}
