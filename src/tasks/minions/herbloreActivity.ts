import { percentChance } from 'e';
import { Task } from 'klasa';

import Herblore from '../../lib/skilling/skills/herblore/herblore';
import { SkillsEnum } from '../../lib/skilling/types';
import { HerbloreActivityTaskOptions } from '../../lib/types/minions';
import { itemID } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: HerbloreActivityTaskOptions) {
		let { mixableID, quantity, zahur, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);

		const mixableItem = Herblore.Mixables.find(mixable => mixable.id === mixableID)!;

		const isMixingPotion = mixableItem.xp !== 0 && !mixableItem.wesley && !mixableItem.zahur;
		const hasHerbMasterCape = user.hasItemEquippedAnywhere(itemID('Herblore master cape'));
		const herbCapePerk = isMixingPotion && hasHerbMasterCape;
		let bonus = 0;
		if (herbCapePerk) {
			for (let i = 0; i < quantity; i++) {
				if (percentChance(10)) {
					bonus++;
				}
			}
			quantity += bonus;
		}

		const xpReceived = zahur && mixableItem.zahur === true ? 0 : quantity * mixableItem.xp;

		if (mixableItem.outputMultiple) {
			quantity *= mixableItem.outputMultiple;
		}

		const xpRes = await user.addXP(SkillsEnum.Herblore, xpReceived, duration);

		let str = `${user}, ${user.minionName} finished making ${quantity - bonus} ${
			mixableItem.name
		}s. ${xpRes} ${bonus > 0 ? `\n\n**${bonus}x extra for Herblore master cape**` : ''}`;

		const loot = {
			[mixableItem.id]: quantity
		};

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${mixableItem.name}[${mixableItem.id}]`);
				return this.client.commands.get('mix')!.run(res, [quantity, mixableItem.name]);
			},
			undefined,
			data,
			loot
		);
	}
}
