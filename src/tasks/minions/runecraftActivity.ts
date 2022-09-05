import { Bank } from 'oldschooljs';

import { Emoji, Events } from '../../lib/constants';
import Runecraft from '../../lib/skilling/skills/runecraft';
import { SkillsEnum } from '../../lib/skilling/types';
import { RunecraftActivityTaskOptions } from '../../lib/types/minions';
import { roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { calcMaxRCQuantity } from '../../mahoji/mahojiSettings';

export const runecraftTask: MinionTask = {
	type: 'Runecraft',
	async run(data: RunecraftActivityTaskOptions) {
		const { runeID, essenceQuantity, userID, channelID, imbueCasts, duration, useStaminas } = data;
		const user = await mUserFetch(userID);

		const rune = Runecraft.Runes.find(_rune => _rune.id === runeID)!;

		const quantityPerEssence = calcMaxRCQuantity(rune, user);
		const runeQuantity = essenceQuantity * quantityPerEssence;

		const xpReceived = essenceQuantity * rune.xp;

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

		const loot = new Bank({
			[rune.id]: runeQuantity
		});

		if (roll((1_795_758 - user.skillLevel(SkillsEnum.Runecraft) * 25) / essenceQuantity)) {
			loot.add('Rift guardian');
			str += "\nYou have a funny feeling you're being followed...";
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Runecraft} **${user.usernameOrMention}'s** minion, ${
					user.minionName
				}, just received a Rift guardian while crafting ${rune.name}s at level ${user.skillLevel(
					SkillsEnum.Runecraft
				)} Runecrafting!`
			);
		}

		str += `\n\nYou received: ${loot}.`;

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(
			user,
			channelID,
			str,
			['runecraft', { quantity: essenceQuantity, rune: rune.name, usestams: useStaminas }, true],
			undefined,
			data,
			loot
		);
	}
};
