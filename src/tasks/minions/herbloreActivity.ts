import { percentChance, roll, Time } from 'e';
import { Bank } from 'oldschooljs';

import { herbertDroprate } from '../../lib/constants';
import Herblore from '../../lib/skilling/skills/herblore/herblore';
import { Mixable, SkillsEnum } from '../../lib/skilling/types';
import { HerbloreActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

function BSOApplyExtraQuantity(user: MUser, quantity: number, mixableItem: Mixable, messages: string[]) {
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
	}
	if (bonus > 0) {
		messages.push(`${bonus}x extra for Herblore master cape`);
	}
	return quantity + bonus;
}

function BSOHerbetRoll(user: MUser, duration: number, mixableItem: Mixable, loot: Bank, messages: string[]) {
	const isMixingPotion = mixableItem.xp !== 0 && !mixableItem.wesley && !mixableItem.zahur;
	const petChance = herbertDroprate(user.skillsAsXP.herblore, mixableItem.level);
	const minutes = Math.floor(duration / Time.Minute);
	if (isMixingPotion && minutes > 0) {
		for (let i = 0; i < minutes; i++) {
			if (roll(petChance)) {
				loot.add('Herbert');
				messages.push('You incorrectly mixed some ingredients, and created Herbert, a weird herby creature!');
			}
		}
	}
}

export const herbloreTask: MinionTask = {
	type: 'Herblore',
	async run(data: HerbloreActivityTaskOptions) {
		let { mixableID, quantity, zahur, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);
		const mixableItem = Herblore.Mixables.find(mixable => mixable.item.id === mixableID)!;
		const messages: string[] = [];
		quantity = BSOApplyExtraQuantity(user, quantity, mixableItem, messages);
		const xpReceived = zahur && mixableItem.zahur ? 0 : quantity * mixableItem.xp;
		const outputQuantity = mixableItem.outputMultiple ? quantity * mixableItem.outputMultiple : quantity;

		const xpRes = await user.addXP({ skillName: SkillsEnum.Herblore, amount: xpReceived, duration });
		const loot = new Bank().add(mixableItem.item.id, outputQuantity);

		BSOHerbetRoll(user, duration, mixableItem, loot, messages);

		await transactItems({ userID: user.id, collectionLog: true, itemsToAdd: loot });

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished making ${outputQuantity}x ${mixableItem.item.name}. ${xpRes}`,
			undefined,
			data,
			loot,
			messages
		);
	}
};
