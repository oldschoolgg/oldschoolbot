import { Time, percentChance } from 'e';
import { Bank } from 'oldschooljs';

import { BlacksmithOutfit } from '../../lib/bsoOpenables';
import { MIN_LENGTH_FOR_PET } from '../../lib/constants';
import { globalDroprates } from '../../lib/data/globalDroprates';
import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import type { SmeltingActivityTaskOptions } from '../../lib/types/minions';
import { clAdjustedDroprate, roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';

export const smeltingTask: MinionTask = {
	type: 'Smelting',
	async run(data: SmeltingActivityTaskOptions) {
		let { barID, quantity, userID, channelID, duration, blastf } = data;
		const user = await mUserFetch(userID);

		const bar = Smithing.Bars.find(bar => bar.id === barID)!;

		// If this bar has a chance of failing to smelt, calculate that here.
		const masterCapeInEffect = bar.chanceOfFail > 0 && user.hasEquippedOrInBank('Smithing master cape');
		const hasBS = user.hasEquippedOrInBank(BlacksmithOutfit, 'every');
		const oldQuantity = quantity;
		if ((bar.chanceOfFail > 0 && bar.name !== 'Iron bar') || (!blastf && bar.name === 'Iron bar')) {
			const chance = masterCapeInEffect ? bar.chanceOfFail / 2 : bar.chanceOfFail;
			let newQuantity = 0;
			for (let i = 0; i < quantity; i++) {
				if (!percentChance(chance)) {
					newQuantity++;
				}
			}
			quantity = newQuantity;
		}

		let xpReceived = quantity * bar.xp;

		if (bar.id === itemID('Gold bar') && user.hasEquippedOrInBank('Goldsmith gauntlets')) {
			xpReceived = quantity * 56.2;
		}

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Smithing,
			amount: xpReceived * (hasBS ? 1.1 : 1),
			duration
		});

		let str = `${user}, ${user.minionName} finished smelting ${quantity}x ${bar.name}. ${xpRes}`;

		if (bar.chanceOfFail > 0 && oldQuantity > quantity) {
			str += `\n\n${oldQuantity - quantity} ${bar.name}s failed to smelt.`;
		}

		if (masterCapeInEffect) {
			if (!(blastf && bar.id === itemID('Iron bar'))) {
				str += '\n2x less likely to fail from Smithing master cape.';
			}
		}

		if (hasBS) {
			str += '\n10% more XP for owning the blacksmith outfit.';
		}

		const loot = new Bank({
			[bar.id]: quantity
		});

		if (duration >= MIN_LENGTH_FOR_PET && !blastf && user.QP > 10) {
			const numMinutes = duration / Time.Minute;
			const petChance = clAdjustedDroprate(
				user,
				'Zak',
				globalDroprates.zak.baseRate,
				globalDroprates.zak.clIncrease
			);
			for (let i = 0; i < numMinutes; i++) {
				if (roll(petChance)) {
					str +=
						'\n\n<:zak:751035589952012298> While Smelting ores on Neitiznot, a Yak approaches you and says "Moooo". and is now following you around. You decide to name him \'Zak\'.';
					loot.add('Zak');
					break;
				}
			}
		}

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
