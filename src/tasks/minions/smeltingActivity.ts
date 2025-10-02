import { BlacksmithOutfit, MIN_LENGTH_FOR_PET } from '@/lib/bso/bsoConstants.js';
import { clAdjustedDroprate } from '@/lib/bso/bsoUtil.js';
import { globalDroprates } from '@/lib/bso/globalDroprates.js';

import { percentChance, roll } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { Bank, itemID } from 'oldschooljs';

import Smithing from '@/lib/skilling/skills/smithing/index.js';
import type { SmeltingActivityTaskOptions } from '@/lib/types/minions.js';

export const smeltingTask: MinionTask = {
	type: 'Smelting',
	async run(data: SmeltingActivityTaskOptions, { user, handleTripFinish }) {
		let { barID, quantity, channelID, duration, blastf } = data;

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
			skillName: 'smithing',
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

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
