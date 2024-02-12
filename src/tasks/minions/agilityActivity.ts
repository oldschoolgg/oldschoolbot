import { increaseNumByPercent, randInt, roll, Time } from 'e';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { Emoji, Events } from '../../lib/constants';
import { ArdougneDiary, userhasDiaryTier } from '../../lib/diaries';
import Agility from '../../lib/skilling/skills/agility';
import { SkillsEnum } from '../../lib/skilling/types';
import { AgilityActivityTaskOptions } from '../../lib/types/minions';
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
		let { courseID, quantity, userID, channelID, duration, alch } = data;
		const user = await mUserFetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Agility);

		const course = Agility.Courses.find(course => course.name === courseID)!;

		// Calculate failed laps
		let lapsFailed = 0;
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

		// Calculate marks of grace
		let totalMarks = 0;
		const timePerLap = course.lapTime * Time.Second;
		const maxQuantity = Math.floor((Time.Minute * 30) / timePerLap);
		if (course.marksPer60) {
			for (let i = 0; i < Math.floor(course.marksPer60 * (quantity / maxQuantity)); i++) {
				if (roll(2)) {
					totalMarks += 1;
				}
			}
		}
		if (course.id !== 5 && user.skillLevel(SkillsEnum.Agility) >= course.level + 20) {
			totalMarks = Math.ceil(totalMarks / 5);
		}

		const [hasArdyElite] = await userhasDiaryTier(user, ArdougneDiary.elite);
		const diaryBonus = hasArdyElite && course.name === 'Ardougne Rooftop Course';
		if (diaryBonus) {
			totalMarks = Math.floor(increaseNumByPercent(totalMarks, 25));
		}

		const xpReceived =
			(quantity - lapsFailed / 2) * (typeof course.xp === 'number' ? course.xp : course.xp(currentLevel));

		const { laps_scores: newLapScores } = await userStatsUpdate(
			user.id,
			({ laps_scores }) => ({
				laps_scores: addItemToBank(laps_scores as ItemBank, course.id, quantity - lapsFailed)
			}),
			{ laps_scores: true }
		);

		let xpRes = await user.addXP({
			skillName: SkillsEnum.Agility,
			amount: xpReceived,
			duration
		});

		const loot = new Bank();
		if (course.marksPer60) loot.add('Mark of grace', totalMarks);

		// Calculate Crystal Shards for Priff
		if (course.name === 'Prifddinas Rooftop Course') {
			// 15 Shards per hour
			loot.add('Crystal shard', Math.floor((duration / Time.Hour) * 15));
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
		}.\n${xpRes}`;

		if (course.id === 6) {
			const currentLapCount = (newLapScores as ItemBank)[course.id];
			for (const monkey of Agility.MonkeyBackpacks) {
				if (currentLapCount < monkey.lapsRequired) break;
				if (!user.hasEquippedOrInBank(monkey.id)) {
					loot.add(monkey.id);
					str += `\nYou received the ${monkey.name} monkey backpack!`;
				}
			}
		}

		// Roll for pet
		const { petDropRate } = skillingPetDropRate(user, SkillsEnum.Agility, course.petChance);
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
