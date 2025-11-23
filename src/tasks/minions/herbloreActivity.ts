import { herbertDroprate } from '@/lib/bso/bsoUtil.js';

import { Time } from '@oldschoolgg/toolkit';
import { Bank, EItem } from 'oldschooljs';

import Herblore from '@/lib/skilling/skills/herblore/herblore.js';
import type { Mixable } from '@/lib/skilling/types.js';
import type { HerbloreActivityTaskOptions } from '@/lib/types/minions.js';

function BSOApplyExtraQuantity(
	rng: RNGProvider,
	user: MUser,
	quantity: number,
	mixableItem: Mixable,
	messages: string[]
) {
	const isMixingPotion = mixableItem.xp !== 0 && !mixableItem.wesley && !mixableItem.zahur;
	const hasHerbMasterCape = user.hasEquippedOrInBank('Herblore master cape');
	const herbCapePerk = isMixingPotion && hasHerbMasterCape;
	let bonus = 0;
	if (herbCapePerk) {
		for (let i = 0; i < quantity; i++) {
			if (rng.percentChance(10)) {
				bonus++;
			}
		}
	}
	if (bonus > 0) {
		messages.push(`${bonus}x extra for Herblore master cape`);
	}
	return quantity + bonus;
}

function BSOHerbetRoll(
	rng: RNGProvider,
	user: MUser,
	duration: number,
	mixableItem: Mixable,
	loot: Bank,
	messages: string[]
) {
	const isMixingPotion = mixableItem.xp !== 0 && !mixableItem.wesley && !mixableItem.zahur;
	const petChance = herbertDroprate(user.skillsAsXP.herblore, mixableItem.level);
	const minutes = Math.floor(duration / Time.Minute);
	if (isMixingPotion && minutes > 0) {
		for (let i = 0; i < minutes; i++) {
			if (rng.roll(petChance)) {
				loot.add('Herbert');
				messages.push('You incorrectly mixed some ingredients, and created Herbert, a weird herby creature!');
			}
		}
	}
}

export const herbloreTask: MinionTask = {
	type: 'Herblore',
	async run(data: HerbloreActivityTaskOptions, { user, handleTripFinish, rng }) {
		let { mixableID, quantity, zahur, wesley, channelId, duration } = data;

		const mixableItem = Herblore.Mixables.find(mixable => mixable.item.id === mixableID)!;
		const messages: string[] = [];
		quantity = BSOApplyExtraQuantity(rng, user, quantity, mixableItem, messages);
		const xpReceived = zahur && mixableItem.zahur ? 0 : quantity * mixableItem.xp;
		let outputQuantity = mixableItem.outputMultiple ? quantity * mixableItem.outputMultiple : quantity;

		// Special case for Lava scale shard
		if (mixableItem.item.id === EItem.LAVA_SCALE_SHARD) {
			const hasWildyDiary = user.hasDiary('wilderness.hard');
			const currentHerbLevel = user.skillsAsLevels.herblore;
			let scales = 0;
			// Having 99 herblore gives a 98% chance to recieve the max amount of shards
			const maxShardChance = currentHerbLevel >= 99 ? 98 : 0;
			// Completion of hard wilderness diary gives 50% more lava scale shards per lava scale, rounded down
			const diaryMultiplier = hasWildyDiary ? 1.5 : 1;

			if (wesley) {
				// Wesley always turns Lava scales into 3 lava scale shards
				scales = quantity * 3;
			} else {
				// Math for if the user is using their minion to make lava scale shards
				for (let i = 0; i < quantity; i++) {
					scales += Math.floor((rng.percentChance(maxShardChance) ? 6 : rng.randInt(3, 6)) * diaryMultiplier);
				}
			}
			outputQuantity = scales;
		}

		const xpRes = await user.addXP({ skillName: 'herblore', amount: xpReceived, duration });
		const loot = new Bank().add(mixableItem.item.id, outputQuantity);

		BSOHerbetRoll(rng, user, duration, mixableItem, loot, messages);

		await user.transactItems({ collectionLog: true, itemsToAdd: loot });

		handleTripFinish(
			user,
			channelId,
			`${user}, ${user.minionName} finished making ${outputQuantity}x ${mixableItem.item.name}. ${xpRes}`,
			data,
			loot,
			messages
		);
	}
};
