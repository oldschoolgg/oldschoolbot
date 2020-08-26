import { Task } from 'klasa';

import { roll, multiplyBank } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SkillsEnum } from '../../lib/skilling/types';
import { FletchingActivityTaskOptions } from '../../lib/types/minions';
import Fletching from '../../lib/skilling/skills/fletching/fletching';
import { getRandomMysteryBox } from '../../lib/openables';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run({
		fletchableName,
		quantity,
		userID,
		channelID,
		duration
	}: FletchingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Fletching);

		const fletchableItem = Fletching.Fletchables.find(
			fletchable => fletchable.name === fletchableName
		);

		if (!fletchableItem) return;

		const xpReceived = quantity * fletchableItem.xp;

		if (fletchableItem.outputMultiple) {
			quantity *= fletchableItem.outputMultiple;
		}

		await user.addXP(SkillsEnum.Fletching, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Fletching);

		let str = `${user}, ${user.minionName} finished fletching ${quantity} ${
			fletchableItem.name
		}s, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Fletching level is now ${newLevel}!`;
		}

		let loot = {
			[fletchableItem.id]: quantity
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
			user.log(`continued trip of ${quantity}x ${fletchableItem.name}[${fletchableItem.id}]`);
			return this.client.commands.get('fletch')!.run(res, [quantity, fletchableItem.name]);
=======
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
						user.log(
							`continued trip of ${quantity}x ${fletchableItem.name}[${fletchableItem.id}]`
						);
						this.client.commands
							.get('fletch')!
							.run(response as KlasaMessage, [quantity, fletchableItem.name])
							.catch(err => channel.send(err));
					}
				})
				.catch(noOp);
>>>>>>> b6851c1... Misc updates (#555)
		});
	}
}
