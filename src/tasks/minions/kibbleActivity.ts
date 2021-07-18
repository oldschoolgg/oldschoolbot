import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import { kibbles } from '../../commands/bso/kibble';
import { SkillsEnum } from '../../lib/skilling/types';

import { KibbleOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: KibbleOptions) {
		let { quantity, channelID, userID, kibbleType, duration } = data;
		const user = await this.client.users.fetch(userID);

        const kibble = kibbles.find(k => k.type === kibbleType)!;
        const loot = new Bank().add(kibble.item.id, quantity);
        await user.addItemsToBank(loot, true);
        let xpRes = await user.addXP({ skillName: SkillsEnum.Cooking, amount: kibble.xp * quantity, duration });

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, your minion finished cooking ${quantity}x ${kibble.item.name}. ${xpRes}`,
			res => {
				user.log(`continued kibble trip`);
				return this.client.commands.get('kibble')!.run(res, [quantity, kibble.item.name]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
