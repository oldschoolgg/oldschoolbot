import { Bank } from 'oldschooljs';

import { randomizeBank } from '../../lib/randomizer';
import Herblore from '../../lib/skilling/skills/herblore/herblore';
import { SkillsEnum } from '../../lib/skilling/types';
import { HerbloreActivityTaskOptions } from '../../lib/types/minions';
import { percentChance } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const herbloreTask: MinionTask = {
	type: 'Herblore',
	async run(data: HerbloreActivityTaskOptions) {
		let { mixableID, quantity, zahur, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);

		const mixableItem = Herblore.Mixables.find(mixable => mixable.id === mixableID)!;

		const isMixingPotion = mixableItem.xp !== 0 && !mixableItem.wesley && !mixableItem.zahur;
		const hasHerbMasterCape = user.hasEquipped('Herblore master cape');
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

		let outputQuantity = quantity;

		if (mixableItem.outputMultiple) {
			outputQuantity *= mixableItem.outputMultiple;
		}

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Herblore,
			amount: xpReceived,
			duration
		});

		let str = `${user}, ${user.minionName} finished making ${outputQuantity - bonus} ${
			mixableItem.name
		}s. ${xpRes} ${bonus > 0 ? `\n\n**${bonus}x extra for Herblore master cape**` : ''}`;

		let loot = new Bank().add(mixableItem.id, outputQuantity);

		loot = randomizeBank(user.id, loot);
		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
