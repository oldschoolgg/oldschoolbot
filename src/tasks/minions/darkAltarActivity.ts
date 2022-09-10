import { increaseNumByPercent, roll } from 'e';
import { Bank } from 'oldschooljs';

import { Events } from '../../lib/constants';
import { darkAltarRunes } from '../../lib/minions/functions/darkAltarCommand';
import { SkillsEnum } from '../../lib/skilling/types';
import { DarkAltarOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const darkAltarTask: MinionTask = {
	type: 'DarkAltar',
	async run(data: DarkAltarOptions) {
		const { quantity, userID, channelID, duration, hasElite, rune } = data;
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
		if (hasElite) {
			runeQuantity = Math.floor(increaseNumByPercent(runeQuantity, 10));
		}

		let loot = new Bank().add(runeData.item.id, runeQuantity);

		const lvl = user.skillLevel(SkillsEnum.Runecraft);
		for (let i = 0; i < quantity; i++) {
			if (roll(runeData.petChance - lvl * 25)) {
				loot.add('Rift guardian');
			}
		}

		let str = `${user}, ${user.minionName} finished runecrafting at the Dark altar, you received ${loot}. ${xpRes1} ${xpRes2} ${xpRes3}`;

		if (loot.amount('Rift guardian') > 0) {
			str += "\n\n**You have a funny feeling you're being followed...**";
			globalClient.emit(
				Events.ServerNotification,
				`**${user.usernameOrMention}'s** minion, ${
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

		handleTripFinish(user, channelID, str, ['runecraft', { rune }, true], undefined, data, loot);
	}
};
