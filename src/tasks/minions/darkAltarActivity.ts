import { Events, increaseNumByPercent } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { darkAltarRunes } from '@/lib/minions/functions/darkAltarCommand.js';
import { bloodEssence, raimentBonus } from '@/lib/skilling/functions/calcsRunecrafting.js';
import type { DarkAltarOptions } from '@/lib/types/minions.js';
import { skillingPetDropRate } from '@/lib/util.js';

export const darkAltarTask: MinionTask = {
	type: 'DarkAltar',
	async run(data: DarkAltarOptions, { user, handleTripFinish, rng }) {
		const { quantity, channelId, duration, hasElite, rune, useExtracts } = data;

		const runeData = darkAltarRunes[rune];

		const [xpRes1, xpRes2, xpRes3] = await Promise.all([
			user.addXP({
				skillName: 'runecraft',
				amount: quantity * runeData.xp,
				duration,
				source: 'DarkAltar'
			}),
			user.addXP({
				skillName: 'crafting',
				amount: quantity * 1.7,
				duration,
				source: 'DarkAltar'
			}),
			user.addXP({
				skillName: 'mining',
				amount: quantity * 2.7,
				duration,
				source: 'DarkAltar'
			})
		]);

		let runeQuantity = quantity;
		let bonusQuantity = 0;
		if (hasElite) {
			runeQuantity = Math.floor(increaseNumByPercent(runeQuantity, 10));
		}

		const raimentQuantity = raimentBonus(user, quantity);
		runeQuantity += raimentQuantity;
		bonusQuantity += raimentQuantity;

		let bonusBlood = 0;
		if (rune === 'blood') {
			bonusBlood = await bloodEssence(rng, user, quantity);
			runeQuantity += bonusBlood;
		}

		let extractBonus = 0;
		if (useExtracts) {
			extractBonus = 60 * quantity;
			runeQuantity += extractBonus;
		}

		const loot = new Bank().add(runeData.item.id, runeQuantity);
		const { petDropRate } = skillingPetDropRate(user, 'runecraft', runeData.petChance);
		for (let i = 0; i < quantity; i++) {
			if (rng.roll(petDropRate)) {
				loot.add('Rift guardian');
			}
		}

		let str = `${user}, ${user.minionName} finished runecrafting at the Dark altar, you received ${loot}. ${xpRes1} ${xpRes2} ${xpRes3}`;

		if (bonusQuantity > 0) {
			str += ` **Bonus Quantity:** ${bonusQuantity.toLocaleString()}`;
		}

		if (bonusBlood > 0) {
			str += ` **Blood essence Quantity:** ${bonusBlood.toLocaleString()}`;
		}

		if (useExtracts) {
			str += ` **Extract bonus:** ${extractBonus.toLocaleString()}`;
		}

		if (loot.has('Rift guardian')) {
			globalClient.emit(
				Events.ServerNotification,
				`**${user.badgedUsername}'s** minion, ${
					user.minionName
				}, just received a Rift guardian while crafting ${runeData.item.name}s at level ${user.skillLevel(
					'runecraft'
				)} Runecrafting!`
			);
		}

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish({ user, channelId, message: str, data, loot });
	}
};
