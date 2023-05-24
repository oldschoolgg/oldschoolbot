import { percentChance } from 'e';
import { Bank } from 'oldschooljs';

import { Emoji, Events } from '../../lib/constants';
import { degradeItem } from '../../lib/degradeableItems';
import Runecraft from '../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../lib/skilling/types';
import type { RunecraftActivityTaskOptions } from '../../lib/types/minions';
import { roll, skillingPetDropRate } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { calcMaxRCQuantity } from '../../mahoji/mahojiSettings';

export const runecraftTask: MinionTask = {
	type: 'Runecraft',
	async run(data: RunecraftActivityTaskOptions) {
		const { runeID, essenceQuantity, userID, channelID, imbueCasts, duration, daeyaltEssence, bloodEssence } = data;
		const user = await mUserFetch(userID);

		const rune = Runecraft.Runes.find(_rune => _rune.id === runeID)!;

		const quantityPerEssence = calcMaxRCQuantity(rune, user);
		let runeQuantity = essenceQuantity * quantityPerEssence;
		let bonusQuantity = 0;
		let bloodEssenceQuantity = 0;

		let runeXP = rune.xp;

		if (daeyaltEssence) {
			runeXP = rune.xp * 1.5;
		}

		const xpReceived = essenceQuantity * runeXP;

		const magicXpReceived = imbueCasts * 86;

		let xpRes = `\n${await user.addXP({
			skillName: SkillsEnum.Runecraft,
			amount: xpReceived,
			duration
		})}`;
		if (magicXpReceived > 0) {
			xpRes += `\n${await user.addXP({ skillName: SkillsEnum.Magic, amount: magicXpReceived, duration })}`;
		}

		let str = `${user}, ${user.minionName} finished crafting ${runeQuantity} ${rune.name}. ${xpRes}`;

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

		const loot = new Bank({
			[rune.id]: runeQuantity
		});
		const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Runecraft, 1_795_758);
		if (roll(petDropRate / essenceQuantity)) {
			loot.add('Rift guardian');
			str += "\nYou have a funny feeling you're being followed...";
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Runecraft} **${user.badgedUsername}'s** minion, ${
					user.minionName
				}, just received a Rift guardian while crafting ${rune.name}s at level ${user.skillLevel(
					SkillsEnum.Runecraft
				)} Runecrafting!`
			);
		}

		if (daeyaltEssence) {
			str += '\nYou are gaining 50% more Runecrafting XP due to using Daeyalt Essence.';
		}

		str += `\n\nYou received: ${loot}.`;

		if (bonusQuantity > 0) {
			str += ` **Bonus Quantity:** ${bonusQuantity.toLocaleString()}`;
		}

		if (bloodEssenceQuantity > 0) {
			str += ` **Blood essence Quantity:** ${bloodEssenceQuantity.toLocaleString()}`;
		}

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
