import { randInt } from 'e';
import { Bank, type Item } from 'oldschooljs';

import { WildernessDiary, userhasDiaryTier } from '../../lib/diaries';
import Herblore from '../../lib/skilling/skills/herblore/herblore';
import { SkillsEnum } from '../../lib/skilling/types';
import type { HerbloreActivityTaskOptions } from '../../lib/types/minions';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { percentChance } from '../../lib/util/rng';

const herbNames = [
	'Guam leaf',
	'Marrentill',
	'Tarromin',
	'Harralander',
	'Ranarr weed',
	'Toadflax',
	'Irit leaf',
	'Avantoe',
	'Kwuarm',
	'Snapdragon',
	'Cadantine',
	'Huasca',
	'Lantadyme',
	'Dwarf weed',
	'Torstol'
];

function isSecondary(item: Item, mixableName: string): boolean {
	if (item.name === 'Vial of water') return false;
	if (item.name.toLowerCase().includes('(unf)')) return false;
	if (mixableName === 'Serum 207 (3)' && item.name === 'Ashes') return false;

	if (herbNames.includes(item.name)) {
		if (
			item.name === 'Torstol' &&
			(mixableName === 'Super combat potion (4)' || mixableName === 'Anti-venom+(4)')
		) {
			return true;
		}
		if (
			item.name === 'Irit leaf' &&
			mixableName.includes('Antidote++') &&
			mixableName.toLowerCase().includes('unf')
		) {
			return true;
		}
		return false;
	}

	return true;
}

export const herbloreTask: MinionTask = {
	type: 'Herblore',
	async run(data: HerbloreActivityTaskOptions) {
		const { mixableID, quantity, zahur, wesley, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);
		const mixableItem = Herblore.Mixables.find(mixable => mixable.item.id === mixableID)!;
		const xpReceived = zahur && mixableItem.zahur ? 0 : quantity * mixableItem.xp;
		let outputQuantity = mixableItem.outputMultiple ? quantity * mixableItem.outputMultiple : quantity;

		// Special case for Lava scale shard
		if (mixableItem.item === getOSItem('Lava scale shard')) {
			const [hasWildyDiary] = await userhasDiaryTier(user, WildernessDiary.hard);
			const currentHerbLevel = user.skillLevel(SkillsEnum.Herblore);
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
					scales += Math.floor((percentChance(maxShardChance) ? 6 : randInt(3, 6)) * diaryMultiplier);
				}
			}
			outputQuantity = scales;
		}

		const savedItems = new Bank();
		const hasGoggles = user.gear.skilling.hasEquipped('Prescription goggles');
		if (hasGoggles) {
			for (let i = 0; i < quantity; i++) {
				for (const [item, qty] of mixableItem.inputItems.items()) {
					if (!isSecondary(item, mixableItem.item.name)) continue;
					for (let q = 0; q < qty; q++) {
						if (percentChance(10)) {
							savedItems.add(item, 1);
						}
					}
				}
			}
		}

		const xpRes = await user.addXP({ skillName: SkillsEnum.Herblore, amount: xpReceived, duration });
		const loot = new Bank().add(mixableItem.item.id, outputQuantity).add(savedItems);

		await transactItems({ userID: user.id, collectionLog: true, itemsToAdd: loot });

		const savedStr = savedItems.length > 0 ? ` Your prescription goggles saved ${savedItems}.` : '';

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished making ${outputQuantity}x ${mixableItem.item.name}. ${xpRes}.${savedStr}`,
			undefined,
			data,
			loot
		);
	}
};
