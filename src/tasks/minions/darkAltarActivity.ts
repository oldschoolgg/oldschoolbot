import { increaseNumByPercent, percentChance, roll } from 'e';
import { Bank } from 'oldschooljs';

import { Events } from '../../lib/constants';
import { degradeItem } from '../../lib/degradeableItems';
import { darkAltarRunes } from '../../lib/minions/functions/darkAltarCommand';
import Runecraft from '../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../lib/skilling/types';
import { DarkAltarOptions } from '../../lib/types/minions';
import { skillingPetDropRate } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const darkAltarTask: MinionTask = {
	type: 'DarkAltar',
	async run(data: DarkAltarOptions) {
		const { quantity, userID, channelID, duration, hasElite, rune, bloodEssence } = data;
		const user = await mUserFetch(userID);

		const runeData = darkAltarRunes[rune];

		const [xpRes1, xpRes2, xpRes3] = await Promise.all([
			user.addXP({
				skillName: SkillsEnum.Runecraft,
				amount: quantity * runeData.xp,
				duration
			}),
			user.addXP({
				skillName: SkillsEnum.Crafting,
				amount: quantity * 1.7,
				duration
			}),
			user.addXP({
				skillName: SkillsEnum.Mining,
				amount: quantity * 2.7,
				duration
			})
		]);

		let runeQuantity = quantity;
		let bonusQuantity = 0;
		let bloodEssenceQuantity = 0;
		if (hasElite) {
			runeQuantity = Math.floor(increaseNumByPercent(runeQuantity, 10));
		}

		// If they have the entire Raiments of the Eye outfit, give an extra 20% quantity bonus (NO bonus XP)
		if (
			user.gear.skilling.hasEquipped(
				Object.keys(Runecraft.raimentsOfTheEyeItems).map(i => parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(runeQuantity * (60 / 100));
			runeQuantity += amountToAdd;
			bonusQuantity += amountToAdd;
		} else {
			// For each Raiments of the Eye item, check if they have it, give its' quantity boost if so (NO bonus XP).
			for (const [itemID, bonus] of Object.entries(Runecraft.raimentsOfTheEyeItems)) {
				if (user.gear.skilling.hasEquipped([parseInt(itemID)], false)) {
					const amountToAdd = Math.floor(runeQuantity * (bonus / 100));
					bonusQuantity += amountToAdd;
				}
			}
			runeQuantity += bonusQuantity;
		}

		if (bloodEssence) {
			for (let i = 0; i < runeQuantity; i++) {
				if (percentChance(50)) {
					bloodEssenceQuantity += 1;
				}
			}
			await degradeItem({
				item: getOSItem('Blood essence (active)'),
				chargesToDegrade: bloodEssenceQuantity,
				user
			});
			runeQuantity += bloodEssenceQuantity;
		}

		let loot = new Bank().add(runeData.item.id, runeQuantity);
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

		if (bloodEssenceQuantity > 0) {
			str += ` **Blood essence Quantity:** ${bloodEssenceQuantity.toLocaleString()}`;
		}

		if (loot.amount('Rift guardian') > 0) {
			str += "\n\n**You have a funny feeling you're being followed...**";
			globalClient.emit(
				Events.ServerNotification,
				`**${user.badgedUsername}'s** minion, ${
					user.minionName
				}, just received a Rift guardian while crafting ${runeData.item.name}s at level ${user.skillLevel(
					SkillsEnum.Runecraft
				)} Runecrafting!`
			);
		}

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
