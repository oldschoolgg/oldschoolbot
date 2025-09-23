import { increaseNumByPercent, roll } from 'e';
import { Bank } from 'oldschooljs';

import { darkAltarRunes } from '@/lib/minions/functions/darkAltarCommand.js';
import { bloodEssence, raimentBonus } from '@/lib/skilling/functions/calcsRunecrafting.js';
import { SkillsEnum } from '@/lib/skilling/types.js';
import type { DarkAltarOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { skillingPetDropRate } from '@/lib/util.js';

export const darkAltarTask: MinionTask = {
	type: 'DarkAltar',
	async run(data: DarkAltarOptions) {
		const { quantity, userID, channelID, duration, hasElite, rune, useExtracts } = data;
		const user = await mUserFetch(userID);

		const runeData = darkAltarRunes[rune];

		const [xpRes1, xpRes2, xpRes3] = await Promise.all([
			user.addXP({
				skillName: SkillsEnum.Runecraft,
				amount: quantity * runeData.xp,
				duration,
				source: 'DarkAltar'
			}),
			user.addXP({
				skillName: SkillsEnum.Crafting,
				amount: quantity * 1.7,
				duration,
				source: 'DarkAltar'
			}),
			user.addXP({
				skillName: SkillsEnum.Mining,
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
			bonusBlood = await bloodEssence(user, quantity);
			runeQuantity += bonusBlood;
		}

		let extractBonus = 0;
		if (useExtracts) {
			extractBonus = 60 * quantity;
			runeQuantity += extractBonus;
		}

		const loot = new Bank().add(runeData.item.id, runeQuantity);
		const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Runecraft, runeData.petChance);
		for (let i = 0; i < quantity; i++) {
			if (roll(petDropRate)) {
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

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
