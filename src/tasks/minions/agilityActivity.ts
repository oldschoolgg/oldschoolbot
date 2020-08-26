import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp, addItemToBank, multiplyBank } from '../../lib/util';
import { Time, Events, Emoji } from '../../lib/constants';
import { AgilityActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { roll, rand } from 'oldschooljs/dist/util/util';
import Agility from '../../lib/skilling/skills/agility';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import itemID from '../../lib/util/itemID';
import { SkillsEnum } from '../../lib/skilling/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { getRandomMysteryBox } from '../../lib/openables';

export default class extends Task {
	async run({ courseID, quantity, userID, channelID, duration }: AgilityActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Agility);

		const course = Agility.Courses.find(course => course.name === courseID);

		if (!course) return;

		// Calculate failed laps
		let lapsFailed = 0;
		for (let t = 0; t < quantity; t++) {
			if (rand(1, 100) > (100 * user.skillLevel(SkillsEnum.Agility)) / (course.level + 5)) {
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
		} laps and fell on ${lapsFailed} of them, you also received ${xpReceived.toLocaleString()} XP and ${totalMarks}x Mark of grace. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

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

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		this.client.queuePromise(() => {
			channel.send(str);

			channel
				.awaitMessages(mes => mes.author === user && saidYes(mes.content), {
					time: getUsersPerkTier(user) > 1 ? Time.Minute * 10 : Time.Minute * 2,
					max: 1
				})
				.then(messages => {
					const response = messages.first();

					if (response) {
						if (response.author.minionIsBusy) return;

						user.log(`continued trip of ${quantity}x ${course.name} laps`);

						this.client.commands
							.get('laps')!
							.run(response as KlasaMessage, [quantity, course.aliases[0]])
							.catch(err => channel.send(err));
					}
				})
				.catch(noOp);
		});
	}
}
