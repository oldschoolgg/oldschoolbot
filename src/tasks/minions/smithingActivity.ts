import { Task } from 'klasa';

import { roll, multiplyBank } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SkillsEnum } from '../../lib/skilling/types';
import { SmithingActivityTaskOptions } from '../../lib/types/minions';
import Smithing from '../../lib/skilling/skills/smithing/smithing';
import { getRandomMysteryBox } from '../../lib/openables';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run({
		smithedBarID,
		quantity,
		userID,
		channelID,
		duration
	}: SmithingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Smithing);

		const SmithedBar = Smithing.SmithedBars.find(SmithedBar => SmithedBar.id === smithedBarID);
		if (!SmithedBar) return;

		const xpReceived = quantity * SmithedBar.xp;

		await user.addXP(SkillsEnum.Smithing, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Smithing);

		let str = `${user}, ${user.minionName} finished smithing ${quantity *
			SmithedBar.outputMultiple}x ${
			SmithedBar.name
		}, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Smithing level is now ${newLevel}!`;
		}

		let loot = {
			[SmithedBar.id]: quantity * SmithedBar.outputMultiple
		};

		if (roll(10)) {
			if (duration > Time.Minute * 10) {
				loot = multiplyBank(loot, 2);
				loot[getRandomMysteryBox()] = 1;
			}
		}

		await user.addItemsToBank(loot, true);

<<<<<<< HEAD
		handleTripFinish(this.client, user, channelID, str, res => {
			user.log(`continued trip of  ${SmithedBar.name}[${SmithedBar.id}]`);
			return this.client.commands.get('smith')!.run(res, [quantity, SmithedBar.name]);
		});
=======
		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		channel.send(str).catch(noOp);

		channel
			.awaitMessages(mes => mes.author === user && saidYes(mes.content), {
				time: getUsersPerkTier(user) > 1 ? Time.Minute * 10 : Time.Minute * 2,
				max: 1
			})
			.then(messages => {
				const response = messages.first();

				if (response) {
					if (response.author.minionIsBusy) return;

					user.log(`continued trip of  ${SmithedBar.name}[${SmithedBar.id}]`);

					this.client.commands
						.get('smith')!
						.run(response as KlasaMessage, [SmithedBar.name])
						.catch(err => channel.send(err));
				}
			})
			.catch(noOp);
>>>>>>> b6851c1... Misc updates (#555)
	}
}
