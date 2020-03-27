import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SkillsEnum } from '../../lib/types';
import { CookingActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import Cooking from '../../lib/skills/cooking';
import { rand } from 'oldschooljs/dist/util/util';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import itemID from '../../lib/util/itemID';
import bankHasItem from '../../lib/util/bankHasItem';
import { UserSettings } from '../../lib/UserSettings';

export default class extends Task {
	async run({ cookableID, quantity, userID, channelID }: CookingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Cooking);

		const cookable = Cooking.Cookables.find(cookable => cookable.id === cookableID);
		if (!cookable) return;

		// If this item has a chance of failing to cook, calculate that here.
		const oldQuantity = quantity;
		if (cookable.stopBurnAt > 0) {
			let newQuantity = 0;
			for (let i = 0; i < quantity; i++) {
				if (
					rand(0, 100) <
					(100 * user.skillLevel(SkillsEnum.Cooking)) / cookable.stopBurnAt
				) {
					newQuantity++;
				}
			}
			quantity = newQuantity;
		}

		const xpReceived = quantity * cookable.xp;

		// This only applies to items that cooking gauntlets reduce the burn chance for
		if (
			cookable.stopBurnAtCG > 1 &&
			bankHasItem(user.settings.get(UserSettings.Bank), itemID('Cooking gauntlets'))
		) {
			let newQuantity = 0;
			for (let i = 0; i < quantity; i++) {
				if (
					rand(0, 100) <
					(100 * user.skillLevel(SkillsEnum.Cooking)) / cookable.stopBurnAtCG
				) {
					newQuantity++;
				}
			}
			quantity = newQuantity;
		}

		await user.addXP(SkillsEnum.Cooking, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Cooking);

		let str = `${user}, ${user.minionName} finished cooking ${quantity}x ${
			cookable.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Cooking level is now ${newLevel}!`;
		}

		if (cookable.stopBurnAt > 0 && oldQuantity > quantity) {
			str += `\n\n${oldQuantity - quantity} ${cookable.name}s failed to cook.`;
		}

		const loot = {
			[cookable.id]: quantity
		};

		await user.addItemsToBank(loot, true);

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

					user.log(`continued trip of ${oldQuantity}x ${cookable.name}[${cookable.id}]`);

					this.client.commands
						.get('cook')!
						.run(response as KlasaMessage, [oldQuantity, cookable.name]);
				}
			})
			.catch(noOp);
	}
}
