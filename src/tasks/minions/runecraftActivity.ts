import { roll } from '@/lib/util/rng.js';
import { Bank, EItem } from 'oldschooljs';

import { skillingPetDropRate } from '@/lib/util.js';
import { Emoji, Events } from '@oldschoolgg/toolkit/constants';
import { bloodEssence, raimentBonus } from '../../lib/skilling/functions/calcsRunecrafting.js';
import Runecraft from '../../lib/skilling/skills/runecraft.js';
import { SkillsEnum } from '../../lib/skilling/types.js';
import type { RunecraftActivityTaskOptions } from '../../lib/types/minions.js';
import { handleTripFinish } from '../../lib/util/handleTripFinish.js';
import { calcMaxRCQuantity } from '../../mahoji/mahojiSettings.js';

export const runecraftTask: MinionTask = {
	type: 'Runecraft',
	async run(data: RunecraftActivityTaskOptions) {
		const { runeID, essenceQuantity, userID, channelID, imbueCasts, duration, daeyaltEssence, useExtracts } = data;
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
		if (runeID === EItem.BLOOD_RUNE) {
			bonusBlood = await bloodEssence(user, essenceQuantity);
			runeQuantity += bonusBlood;
		}

		let extractBonus = 0;
		if (useExtracts) {
			const f2pRunes = new Set(['Air rune', 'Mind rune', 'Water rune', 'Earth rune', 'Fire rune', 'Body rune']);
			extractBonus = f2pRunes.has(rune.name) ? 250 * essenceQuantity : 60 * essenceQuantity;
			runeQuantity += extractBonus;
		}

		const loot = new Bank({
			[rune.id]: runeQuantity
		});
		const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Runecraft, 1_795_758);
		if (roll(petDropRate / essenceQuantity)) {
			loot.add('Rift guardian');
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
			str += ` **\nRaiments of the eye bonus:** ${bonusQuantity.toLocaleString()}`;
		}

		if (bonusBlood > 0) {
			str += ` **\nBlood essence bonus:** ${bonusBlood.toLocaleString()}`;
		}

		if (useExtracts) {
			str += ` **\nExtract bonus:** ${extractBonus!.toLocaleString()}`;
		}

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
