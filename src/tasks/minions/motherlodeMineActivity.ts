import { roll } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { Emoji, Events } from '../../lib/constants';
import { FaladorDiary, userhasDiaryTier } from '../../lib/diaries';
import Mining from '../../lib/skilling/skills/mining';
import { SkillsEnum } from '../../lib/skilling/types';
import type { MotherlodeMiningActivityTaskOptions } from '../../lib/types/minions';
import { skillingPetDropRate } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const motherlodeMiningTask: MinionTask = {
	type: 'MotherlodeMining',
	async run(data: MotherlodeMiningActivityTaskOptions) {
		const { userID, channelID, duration } = data;
		const { quantity } = data;
		const user = await mUserFetch(userID);
		const motherlode = Mining.MotherlodeMine;

		let xpReceived = quantity * Mining.MotherlodeMine.xp;
		let bonusXP = 0;
		let cleaningXP = 0;

		// If they have the entire prospector outfit, give an extra 0.5% xp bonus
		if (
			user.gear.skilling.hasEquipped(
				Object.keys(Mining.prospectorItems).map(i => Number.parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each prospector item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Mining.prospectorItems)) {
				if (user.hasEquipped(Number.parseInt(itemID))) {
					const amountToAdd = Math.floor(xpReceived * (bonus / 100));
					xpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		const currentLevel = user.skillLevel(SkillsEnum.Mining);

		const loot = new Bank();

		let nuggetWeight = 273;

		if ([43, 57, 71, 85, 99].includes(currentLevel)) {
			nuggetWeight = 313;
		}
		let runiteWeight = currentLevel >= 85 ? Math.round(100 * (0.080_71 * currentLevel - 5.721)) : 0;
		let adamantiteWeight = currentLevel >= 70 ? Math.round(100 * (0.5187 * currentLevel - 32.39)) : 0;
		let mithrilWeight = currentLevel >= 55 ? Math.round(100 * (0.2521 * currentLevel + 2.705)) : 0;
		let goldWeight = currentLevel >= 40 ? Math.round(100 * (0.2211 * currentLevel + 2.807)) : 0;

		// Check for falador elite diary for increased ore rates
		const [hasEliteDiary] = await userhasDiaryTier(user, FaladorDiary.elite);
		if (hasEliteDiary) {
			if (currentLevel >= 85) runiteWeight += 100;
			if (currentLevel >= 70) adamantiteWeight += 100;
			mithrilWeight += 100;
			goldWeight += 100;
		}

		const coalWeight = 10_000 - (nuggetWeight + runiteWeight + adamantiteWeight + mithrilWeight + goldWeight);

		const table = new LootTable()
			.add('Golden nugget', 1, nuggetWeight)
			.add('Runite ore', 1, runiteWeight)
			.add('Adamantite ore', 1, adamantiteWeight)
			.add('Mithril ore', 1, mithrilWeight)
			.add('Gold ore', 1, goldWeight)
			.add('Coal', 1, coalWeight);

		loot.add(table.roll(quantity));
		if (loot.has('Runite ore')) {
			cleaningXP += 75 * loot.amount('Runite ore');
		}
		if (loot.has('Adamantite ore')) {
			cleaningXP += 45 * loot.amount('Adamantite ore');
		}
		if (loot.has('Mithril ore')) {
			cleaningXP += 30 * loot.amount('Mithril ore');
		}
		if (loot.has('Gold ore')) {
			cleaningXP += 15 * loot.amount('Gold ore');
		}
		xpReceived += cleaningXP;

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Mining,
			amount: xpReceived,
			duration,
			source: 'MotherlodeMine'
		});

		let str = `${user}, ${user.minionName} finished mining ${quantity} Pay-dirt. ${xpRes}`;

		const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Mining, motherlode.petChance!);
		if (roll(petDropRate / quantity)) {
			loot.add('Rock golem');
			str += "\nYou have a funny feeling you're being followed...";
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Mining} **${user.usernameOrMention}'s** minion, ${user.minionName}, just received a Rock golem while mining at the ${Mining.MotherlodeMine.name} at level ${currentLevel} Mining!`
			);
		}

		str += `\n\nYou received: ${loot}.`;
		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
