import { increaseNumByPercent, randInt, roll, Time } from 'e';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { Emoji, Events, MIN_LENGTH_FOR_PET } from '../../lib/constants';
import { ArdougneDiary, userhasDiaryTier } from '../../lib/diaries';
import { isDoubleLootActive } from '../../lib/doubleLoot';
import Agility from '../../lib/skilling/skills/agility';
import { gorajanShardChance } from '../../lib/skilling/skills/dung/dungDbFunctions';
import { SkillsEnum } from '../../lib/skilling/types';
import { AgilityActivityTaskOptions } from '../../lib/types/minions';
import { addItemToBank, clAdjustedDroprate, randomVariation, skillingPetDropRate } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { updateGPTrackSetting } from '../../mahoji/mahojiSettings';

export const agilityTask: MinionTask = {
	type: 'Agility',
	async run(data: AgilityActivityTaskOptions) {
		let { courseID, quantity, userID, channelID, duration, alch } = data;
		const user = await mUserFetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Agility);

		const course = Agility.Courses.find(course => course.name === courseID)!;

		// Calculate failed laps
		let lapsFailed = 0;
		for (let t = 0; t < quantity; t++) {
			if (randInt(1, 100) > (100 * user.skillLevel(SkillsEnum.Agility)) / (course.level + 5)) {
				lapsFailed += 1;
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

		if (user.usingPet('Harry')) {
			totalMarks = Math.ceil(randomVariation(totalMarks * 2, 10));
		} else if (user.skillLevel(SkillsEnum.Agility) >= course.level + 20) {
			totalMarks = Math.ceil(totalMarks / 5);
		}

		const [hasArdyElite] = await userhasDiaryTier(user, ArdougneDiary.elite);
		const diaryBonus = hasArdyElite && course.name === 'Ardougne Rooftop Course';
		if (diaryBonus) {
			totalMarks = Math.floor(increaseNumByPercent(totalMarks, 25));
		}

		const xpReceived = (quantity - lapsFailed / 2) * course.xp;

		await user.update({
			lapsScores: addItemToBank(user.user.lapsScores as ItemBank, course.id, quantity - lapsFailed)
		});

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

		if (alch) {
			const alchedItem = getOSItem(alch.itemID);
			const alchGP = alchedItem.highalch! * alch.quantity;
			loot.add('Coins', alchGP);
			xpRes += ` ${await user.addXP({
				skillName: SkillsEnum.Magic,
				amount: alch.quantity * 65,
				duration
			})}`;
			updateGPTrackSetting('gp_alch', alchGP);
		}

		let str = `${user}, ${user.minionName} finished ${quantity} ${
			course.name
		} laps and fell on ${lapsFailed} of them.\nYou received: ${loot}${
			diaryBonus ? ' (25% bonus Marks for Ardougne Elite diary)' : ''
		}.\n${xpRes}`;

		if (user.usingPet('Harry')) {
			str += 'Harry found you extra Marks of grace.';
		}
		if (course.id === 6) {
			const currentLapCount = (user.user.lapsScores as ItemBank)[course.id];
			for (const monkey of Agility.MonkeyBackpacks) {
				if (currentLapCount < monkey.lapsRequired) break;
				if (!user.hasEquippedOrInBank(monkey.id)) {
					loot.add(monkey.id);
					str += `\nYou received the ${monkey.name} monkey backpack!`;
				}
			}
		}
		if (duration >= MIN_LENGTH_FOR_PET) {
			const minutes = duration / Time.Minute;
			if (course.id === 4) {
				for (let i = 0; i < minutes; i++) {
					if (roll(4000)) {
						loot.add('Scruffy');
						str +=
							"\n\n<:scruffy:749945071146762301> As you jump off the rooftop in Varrock, a stray dog covered in flies approaches you. You decide to adopt the dog, and name him 'Scruffy'.";
						break;
					}
				}
			}

			if (course.id === 11) {
				for (let i = 0; i < minutes; i++) {
					if (roll(1600)) {
						loot.add('Harry');
						str +=
							'\n\n<:harry:749945071104819292> As you jump across a rooftop, you notice a monkey perched on the roof - which has escaped from the Ardougne Zoo! You decide to adopt the monkey, and call him Harry.';
						break;
					}
				}
			}

			if (course.id === 12) {
				const dropRate = clAdjustedDroprate(user, 'Skipper', 1600, 1.3);
				for (let i = 0; i < minutes; i++) {
					if (roll(dropRate)) {
						loot.add('Skipper');
						str +=
							"\n\n<:skipper:755853421801766912> As you finish the Penguin agility course, a lone penguin asks if you'd like to hire it as your accountant, you accept.";
						break;
					}
				}
			}

			if (course.id === 30) {
				if (
					user.skillLevel(SkillsEnum.Dungeoneering) >= 80 &&
					roll(Math.floor((gorajanShardChance(user).chance * 2.5) / minutes))
				) {
					const item = roll(30) ? getOSItem('Dungeoneering dye') : getOSItem('Gorajan shards');

					let quantity = 1;

					if (isDoubleLootActive(duration)) {
						quantity *= 2;
					}
					loot.add(item.id, quantity);
					str += `\nYou received **${quantity}x ${item.name}**`;
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

		handleTripFinish(
			user,
			channelID,
			str,
			['laps', { name: course.name, quantity, alch: Boolean(alch) }, true],
			undefined,
			data,
			loot
		);
	}
};
