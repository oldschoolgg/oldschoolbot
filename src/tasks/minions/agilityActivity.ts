import { Time, increaseNumByPercent, percentChance, randInt, roll } from 'e';
import { Bank } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { Emoji, Events } from '../../lib/constants';
import { ArdougneDiary, userhasDiaryTier } from '../../lib/diaries';
import Agility from '../../lib/skilling/skills/agility';
import { SkillsEnum } from '../../lib/skilling/types';
import type { AgilityActivityTaskOptions } from '../../lib/types/minions';
import { addItemToBank, skillingPetDropRate } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { updateClientGPTrackSetting, userStatsUpdate } from '../../mahoji/mahojiSettings';

function chanceOfFailingAgilityPyramid(user: MUser) {
	const lvl = user.skillLevel(SkillsEnum.Agility);
	if (lvl < 40) return 95;
	if (lvl < 50) return 30;
	if (lvl < 60) return 20;
	if (lvl < 75) return 5;
	return 0;
}

export const agilityTask: MinionTask = {
	type: 'Agility',
	async run(data: AgilityActivityTaskOptions) {
		const { courseID, quantity, userID, channelID, duration, alch } = data;
		const loot = new Bank();
		const user = await mUserFetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Agility);
		const course = Agility.Courses.find(course => course.name === courseID)!;

		// Calculate failed laps
		let lapsFailed = 0;
		if (!course.cantFail) {
			if (course.name === 'Agility Pyramid') {
				for (let t = 0; t < quantity; t++) {
					if (randInt(1, 100) < chanceOfFailingAgilityPyramid(user)) {
						lapsFailed += 1;
					}
				}
			} else {
				for (let t = 0; t < quantity; t++) {
					if (randInt(1, 100) > (100 * user.skillLevel(SkillsEnum.Agility)) / (course.level + 5)) {
						lapsFailed += 1;
					}
				}
			}
		}

		const stats = await user.fetchStats({ laps_scores: true });
		const { laps_scores: newLapScores } = await userStatsUpdate(
			user.id,
			{
				laps_scores: addItemToBank(stats.laps_scores as ItemBank, course.id, quantity - lapsFailed)
			},
			{ laps_scores: true }
		);
		const xpReceived =
			(quantity - lapsFailed / 2) * (typeof course.xp === 'number' ? course.xp : course.xp(currentLevel));
		let xpRes = await user.addXP({
			skillName: SkillsEnum.Agility,
			amount: xpReceived,
			duration
		});

		// Calculate marks of grace
		let totalMarks = 0;
		const timePerLap = course.lapTime * Time.Second;
		const maxQuantity = Math.floor((Time.Minute * 30) / timePerLap);
		let diaryBonus = false;
		if (course.marksPer60) {
			const markChance = Math.floor(course.marksPer60 * (quantity / maxQuantity));
			for (let i = 0; i < markChance; i++) {
				if (roll(2)) totalMarks++;
			}
			if (course.id !== 5 && user.skillLevel(SkillsEnum.Agility) >= course.level + 20) {
				totalMarks = Math.ceil(totalMarks / 5);
			}
			const [hasArdyElite] = await userhasDiaryTier(user, ArdougneDiary.elite);
			if (hasArdyElite && course.name === 'Ardougne Rooftop Course') {
				totalMarks = Math.floor(increaseNumByPercent(totalMarks, 25));
				diaryBonus = true;
			}
			loot.add('Mark of grace', totalMarks);
		}

		// Custom loot from various courses
		if (course.name === 'Prifddinas Rooftop Course') {
			loot.add('Crystal shard', quantity); // 1 shard per lap
		}
		if (course.name === 'Colossal Wyrm Agility Course') {
			for (let i = 0; i < quantity; i++) {
				if (roll(3)) {
					loot.add('termites', randInt(8, 10));
					if (percentChance(75)) {
						loot.add('blessed bone shards', randInt(22, 28));
					}
				}
			}
		}
		if (course.name === 'Agility Pyramid') {
			loot.add('Coins', 10_000 * (quantity - lapsFailed));
			await userStatsUpdate(
				user.id,
				{
					gp_from_agil_pyramid: {
						increment: loot.amount('Coins')
					}
				},
				{}
			);
		}
		let monkeyStr = '';
		if (course.name === 'Ape Atoll Agility Course') {
			const currentLapCount = (newLapScores as ItemBank)[course.id];
			for (const monkey of Agility.MonkeyBackpacks) {
				if (currentLapCount < monkey.lapsRequired) break;
				if (!user.hasEquippedOrInBank(monkey.id)) {
					loot.add(monkey.id);
					monkeyStr = `\nYou received the ${monkey.name} monkey backpack!`;
				}
			}
		}

		if (alch) {
			const alchedItem = getOSItem(alch.itemID);
			const alchGP = alchedItem.highalch! * alch.quantity;
			loot.add('Coins', alchGP);
			xpRes += ` ${await user.addXP({
				skillName: SkillsEnum.Magic,
				amount: alch.quantity * 65,
				duration
			})}`;
			updateClientGPTrackSetting('gp_alch', alchGP);
		}

		let str = `${user}, ${user.minionName} finished ${quantity} ${
			course.name
		} laps and fell on ${lapsFailed} of them.\nYou received: ${loot}${
			diaryBonus ? ' (25% bonus Marks for Ardougne Elite diary)' : ''
		}.\n${xpRes}${monkeyStr}`;

		// Roll for pet
		const { petDropRate } = skillingPetDropRate(
			user,
			SkillsEnum.Agility,
			typeof course.petChance === 'number' ? course.petChance : course.petChance(currentLevel)
		);
		if (roll(petDropRate / quantity)) {
			loot.add('Giant squirrel');
			str += "\nYou have a funny feeling you're being followed...";
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.Agility} **${user.usernameOrMention}'s** minion, ${user.minionName}, just received a Giant squirrel while running ${course.name} laps at level ${currentLevel} Agility!`
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
