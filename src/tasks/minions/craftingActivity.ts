import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp, itemID, randFloat } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SkillsEnum } from '../../lib/skilling/types';
import { CraftingActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import Crafting from '../../lib/skilling/skills/crafting/crafting';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { ItemBank } from '../../lib/types';

export default class extends Task {
	async run({ craftableID, quantity, userID, channelID, duration }: CraftingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Crafting);

		const Craft = Crafting.Craftables.find(craft => craft.id === craftableID);

		if (!Craft) return;
		let xpReceived = quantity * Craft.xp;
		const loot: ItemBank = {};

		let crushed = 0;
		if (Craft.crushChance) {
			for (let i = 0; i < quantity; i++) {
				if (
					randFloat(0, 1) >
					(currentLevel - 1) * Craft.crushChance[0] + Craft.crushChance[1]
				) {
					crushed++;
				}
			}
			// crushing a gem only gives 25% exp
			xpReceived -= 0.75 * crushed * Craft.xp;
			loot[itemID('crushed gem')] = crushed;
		}
		loot[Craft.id] = quantity - crushed;

		await user.addXP(SkillsEnum.Crafting, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Crafting);

		let str = `${user}, ${user.minionName} finished crafting ${quantity} ${Craft.name}, ${
			crushed ? `crushing ${crushed} of them, ` : ``
		}you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Crafting level is now ${newLevel}!`;
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
						user.log(`continued trip of ${quantity}x ${Craft.name}[${Craft.id}]`);
						this.client.commands
							.get('craft')!
							.run(response as KlasaMessage, [quantity, Craft.name]);
					}
				})
				.catch(noOp);
		});
	}
}
