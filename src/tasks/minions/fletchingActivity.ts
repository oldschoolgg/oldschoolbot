import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Time } from '../../lib/constants';
import { getRandomMysteryBox } from '../../lib/data/openables';
import Fletching from '../../lib/skilling/skills/fletching/';
import { SkillsEnum } from '../../lib/skilling/types';
import { FletchingActivityTaskOptions } from '../../lib/types/minions';
import { multiplyBank, roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: FletchingActivityTaskOptions) {
		let { fletchableName, quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);

		const fletchableItem = Fletching.Fletchables.find(
			fletchable => fletchable.name === fletchableName
		)!;

		const xpRes = await user.addXP(
			SkillsEnum.Fletching,
			quantity * fletchableItem.xp,
			duration
		);

		let quantityToGive = fletchableItem.outputMultiple
			? quantity * fletchableItem.outputMultiple
			: quantity;

		const loot = new Bank({ [fletchableItem.id]: quantityToGive });
		if (duration > Time.Minute * 20 && roll(10)) {
			loot.multiply(2);
			loot.add(getRandomMysteryBox());
		}
		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${user.minionName} finished fletching ${quantity}x ${fletchableItem.name}, and received ${loot}. ${xpRes}`,
			res => {
				user.log(`continued fletching trip`);
				return this.client.commands
					.get('fletch')!
					.run(res, [quantity, fletchableItem.name]);
			},
			undefined,
			data
		);
	}
}
