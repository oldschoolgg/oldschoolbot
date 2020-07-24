import { KlasaMessage, Task } from 'klasa';

import { noOp, saidYes } from '../../lib/util';
import { Emoji, Events, Time } from '../../lib/constants';
import { AgilityActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { rand, roll } from 'oldschooljs/dist/util/util';
import Agility from '../../lib/skilling/skills/agility';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import itemID from '../../lib/util/itemID';
import { SkillsEnum } from '../../lib/skilling/types';

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
		const loot = {
			[markOfGrace]: totalMarks
		};

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
							.run(response as KlasaMessage, [quantity, course.aliases[0]]);
					}
				})
				.catch(noOp);
		});
	}
}
