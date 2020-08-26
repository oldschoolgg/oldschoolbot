import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp, multiplyBank } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SmeltingActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import Smelting from '../../lib/skilling/skills/smithing/smelting';
import { rand } from 'oldschooljs/dist/util/util';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import itemID from '../../lib/util/itemID';
import { SkillsEnum } from '../../lib/skilling/types';
import { roll } from '../../util';
import { getRandomMysteryBox } from '../../lib/openables';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends Task {
	async run({ barID, quantity, userID, channelID, duration }: SmeltingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Smithing);

		const bar = Smelting.Bars.find(bar => bar.id === barID);
		if (!bar) return;

		// If this bar has a chance of failing to smelt, calculate that here.
		const oldQuantity = quantity;
		if (bar.chanceOfFail > 0) {
			let newQuantity = 0;
			for (let i = 0; i < quantity; i++) {
				if (rand(0, 100) < bar.chanceOfFail) {
					newQuantity++;
				}
			}
			quantity = newQuantity;
		}

		let xpReceived = quantity * bar.xp;

		if (
			bar.id === itemID('Gold bar') &&
			user.hasItemEquippedAnywhere(itemID('Goldsmith gauntlets'))
		) {
			xpReceived = quantity * 56.2;
		}

		await user.addXP(SkillsEnum.Smithing, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Smithing);

		let str = `${user}, ${user.minionName} finished smelting ${quantity}x ${
			bar.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Smithing level is now ${newLevel}!`;
		}

		if (bar.chanceOfFail > 0 && oldQuantity > quantity) {
			str += `\n\n${oldQuantity - quantity} ${bar.name}s failed to smelt.`;
		}

		let loot = {
			[bar.id]: quantity
		};

		if (roll(10)) {
			loot = multiplyBank(loot, 4);
			loot[getRandomMysteryBox()] = 1;
		}

		const numMinutes = duration / Time.Minute;
		if (user.settings.get(UserSettings.QP) > 10) {
			for (let i = 0; i < numMinutes; i++) {
				if (roll(4500)) {
					str += `\n\n<:zak:751035589952012298> While Smelting ores on Neitiznot, a Yak approaches you and says "Moooo". and is now following you around. You decide to name him 'Zak'.`;
					loot[itemID('Zak')] = 1;
					break;
				}
			}
		}

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

					user.log(`continued trip of ${oldQuantity}x ${bar.name}[${bar.id}]`);

					this.client.commands
						.get('smelt')!
						.run(response as KlasaMessage, [oldQuantity, bar.name])
						.catch(err => channel.send(err));
				}
			})
			.catch(noOp);
	}
}
