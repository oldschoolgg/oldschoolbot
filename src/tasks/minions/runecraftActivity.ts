import { Bank, itemID } from 'oldschooljs';

import { Emoji, Events } from '../../lib/constants';
import { bloodEssence, raimentBonus } from '../../lib/skilling/functions/calcsRunecrafting';
import Runecraft from '../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../lib/skilling/types';
import type { RunecraftActivityTaskOptions } from '../../lib/types/minions';
import { roll, skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { calcMaxRCQuantity } from '../../mahoji/mahojiSettings';

export const runecraftTask: MinionTask = {
	type: 'Runecraft',
	async run(data: RunecraftActivityTaskOptions) {
		const { runeID, essenceQuantity, userID, channelID, imbueCasts, duration, daeyaltEssence } = data;
		const user = await mUserFetch(userID);

		const rune = Runecraft.Runes.find(_rune => _rune.id === runeID)!;

		const quantityPerEssence = calcMaxRCQuantity(rune, user);
		let runeQuantity = essenceQuantity * quantityPerEssence;
		let bonusQuantity = 0;

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

		const raimentQuantity = raimentBonus(user, runeQuantity);
		runeQuantity += raimentQuantity;
		bonusQuantity += raimentQuantity;

		let bonusBlood = 0;
		if (runeID === itemID('Blood rune')) {
			bonusBlood = await bloodEssence(user, essenceQuantity);
			runeQuantity += bonusBlood;
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

		if (bonusBlood > 0) {
			str += ` **Blood essence Quantity:** ${bonusBlood.toLocaleString()}`;
		}

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
