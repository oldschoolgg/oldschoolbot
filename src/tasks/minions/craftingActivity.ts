import { Task } from 'klasa';

import { roll, multiplyBank } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SkillsEnum } from '../../lib/skilling/types';
import { CraftingActivityTaskOptions } from '../../lib/types/minions';
import Crafting from '../../lib/skilling/skills/crafting/crafting';
import { getRandomMysteryBox } from '../../lib/openables';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run({ craftableID, quantity, userID, channelID, duration }: CraftingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Crafting);

		const Craft = Crafting.Craftables.find(craft => craft.id === craftableID);

		if (!Craft) return;

		const xpReceived = quantity * Craft.xp;

		await user.addXP(SkillsEnum.Crafting, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Crafting);

		let str = `${user}, ${user.minionName} finished crafting ${quantity} ${
			Craft.name
		}, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Crafting level is now ${newLevel}!`;
		}

		let loot = {
			[Craft.id]: quantity
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
			user.log(`continued trip of ${quantity}x ${Craft.name}[${Craft.id}]`);
			return this.client.commands.get('craft')!.run(res, [quantity, Craft.name]);
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
						user.log(`continued trip of ${quantity}x ${Craft.name}[${Craft.id}]`);
						this.client.commands
							.get('craft')!
							.run(response as KlasaMessage, [quantity, Craft.name])
							.catch(err => channel.send(err));
					}
				})
				.catch(noOp);
>>>>>>> b6851c1... Misc updates (#555)
		});
	}
}
