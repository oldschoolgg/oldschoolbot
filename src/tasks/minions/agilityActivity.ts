import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp } from '../../lib/util';
import { Time, Events, Emoji } from '../../lib/constants';
import { SkillsEnum } from '../../lib/types';
import { AgilityActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { roll, rand } from 'oldschooljs/dist/util/util';
import Agility from '../../lib/skills/agility';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import itemID from '../../lib/util/itemID';

export default class extends Task {
	async run({ courseID, quantity, userID, channelID }: AgilityActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Agility);

		const course = Agility.Courses.find(course => course.name === courseID);

		if (!course) return;

		// Calculate failed laps
		let lapsFailed = 0;
		for (let t = 0; t < quantity; t++) {
			if (rand(1, 100) > 100 * ((course.level + 5) / user.skillLevel(SkillsEnum.Agility))) {
				lapsFailed += 1;
			}
		}

		// Calculate marks of grace
		let totalMarks = 0;
		if (course.marksPer60) {
			for (let i = 0; i < course.marksPer60; i++) {
				if (roll(2)) {
					totalMarks += 1;
				}
			}
		}
		if (user.skillLevel(SkillsEnum.Agility) >= course.level + 20) {
			totalMarks = Math.ceil(totalMarks / 5);
		}

		const xpReceived = Math.floor(quantity - lapsFailed / 4) * course.xp;

		await user.addXP(SkillsEnum.Agility, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Agility);

		let str = `${user}, ${user.minionName} finished ${quantity} ${
			course.name
			} laps, you also received ${xpReceived.toLocaleString()} XP and ${totalMarks}x Mark of grace. ${
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
		if (course.petChance && roll(course.petChance - user.skillLevel(SkillsEnum.Agility) * 25)) {
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
							.run(response as KlasaMessage, [quantity, course.name]);
					}
				})
				.catch(noOp);
		});
	}
}
