import { randInt, roll } from 'e';
import { Task } from 'klasa';

import { Emoji, Events, Time } from '../../lib/constants';
import { getRandomMysteryBox } from '../../lib/openables';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Agility from '../../lib/skilling/skills/agility';
import { SkillsEnum } from '../../lib/skilling/types';
import { AgilityActivityTaskOptions } from '../../lib/types/minions';
import { addItemToBank, multiplyBank } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';

export default class extends Task {
	async run(data: AgilityActivityTaskOptions) {
		let { courseID, quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Agility);

		const course = Agility.Courses.find(course => course.name === courseID);

		if (!course) return;

		// Calculate failed laps
		let lapsFailed = 0;
		for (let t = 0; t < quantity; t++) {
			if (
				randInt(1, 100) >
				(100 * user.skillLevel(SkillsEnum.Agility)) / (course.level + 5)
			) {
				lapsFailed += 1;
			}
		}

		// Calculate marks of grace
		let totalMarks = 0;
		const timePerLap = course.lapTime * Time.Second;
		const maxQuantity = Math.floor(user.maxTripLength / timePerLap);
		if (course.marksPer60) {
			for (let i = 0; i < Math.floor(course.marksPer60 * (quantity / maxQuantity)); i++) {
				if (roll(2)) {
					totalMarks += 1;
				}
			}
		}
		if (user.skillLevel(SkillsEnum.Agility) >= course.level + 20) {
			totalMarks = Math.ceil(totalMarks / 5);
		}

		const xpReceived = (quantity - lapsFailed / 2) * course.xp;

		await user.settings.update(
			UserSettings.LapsScores,
			addItemToBank(
				user.settings.get(UserSettings.LapsScores),
				course.id,
				quantity - lapsFailed
			)
		);

		await user.addXP(SkillsEnum.Agility, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Agility);

		let str = `${user}, ${user.minionName} finished ${quantity} ${
			course.name
		} laps and fell on ${lapsFailed} of them, you also received ${xpReceived.toLocaleString()} XP and ${totalMarks}x Mark of grace.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Agility level is now ${newLevel}!`;
		}

		const markOfGrace = itemID('Mark of grace');
		let loot = {
			[markOfGrace]: totalMarks
		};
		if (roll(10)) {
			loot = multiplyBank(loot, 2);
			loot[getRandomMysteryBox()] = 1;
		}

		if (course.id === 6) {
			const currentLapCount = user.settings.get(UserSettings.LapsScores)[course.id];
			for (const monkey of Agility.MonkeyBackpacks) {
				if (currentLapCount < monkey.lapsRequired) break;
				if (!user.hasItemEquippedOrInBank(monkey.id)) {
					loot[monkey.id] = 1;
					str += `\nYou received the ${monkey.name} monkey backpack!`;
				}
			}
		}

		const minutes = duration / Time.Minute;
		if (course.id === 4) {
			for (let i = 0; i < minutes; i++) {
				if (roll(1200)) {
					loot[itemID('Scruffy')] = 1;
					str += `\n\n<:scruffy:749945071146762301> As you jump off the rooftop in Varrock, a stray dog covered in flies approaches you. You decide to adopt the dog, and name him 'Scruffy'.`;
					break;
				}
			}
		}

		if (course.id === 11) {
			for (let i = 0; i < minutes; i++) {
				if (roll(1200)) {
					loot[itemID('Harry')] = 1;
					str += `\n\n<:harry:749945071104819292> As you jump across a rooftop, you notice a monkey perched on the roof - which has escaped from the Ardougne Zoo! You decide to adopt the monkey, and call him Harry.`;
					break;
				}
			}
		}

		if (course.id === 12) {
			for (let i = 0; i < minutes; i++) {
				if (roll(1200)) {
					loot[itemID('Skipper')] = 1;
					str += `\n\n<:skipper:755853421801766912> As you finish the Penguin agility course, a lone penguin asks if you'd like to hire it as your accountant, you accept.`;
					break;
				}
			}
		}

		// Roll for pet
		if (
			course.petChance &&
			roll((course.petChance - user.skillLevel(SkillsEnum.Agility) * 25) / quantity)
		) {
			loot[itemID('Giant squirrel')] = 1;
			str += `\nYou have a funny feeling you're being followed...`;
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Agility} **${user.username}'s** minion, ${user.minionName}, just received a Giant squirrel while running ${course.name} laps at level ${currentLevel} Agility!`
			);
		}

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${course.name} laps`);
				return this.client.commands.get('laps')!.run(res, [quantity, course.aliases[0]]);
			},
			undefined,
			data
		);
	}
}
