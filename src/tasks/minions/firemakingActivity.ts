import { KlasaMessage, Task } from 'klasa';

import { noOp, saidYes } from '../../lib/util';
import { Time } from '../../lib/constants';
import { FiremakingActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import Firemaking from '../../lib/skilling/skills/firemaking';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { SkillsEnum } from '../../lib/skilling/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import hasArrayOfItemsEquipped from '../../lib/gear/functions/hasArrayOfItemsEquipped';

export default class extends Task {
	async run({
		burnableID,
		quantity,
		userID,
		channelID,
		duration
	}: FiremakingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Firemaking);

		const Burn = Firemaking.Burnables.find(Burn => Burn.inputLogs === burnableID);

		if (!Burn) return;

		let xpReceived = quantity * Burn.xp;
		let bonusXP = 0;

		// If they have the entire pyromancer outfit, give an extra 0.5% xp bonus
		if (
			hasArrayOfItemsEquipped(
				Object.keys(Firemaking.pyromancerItems).map(i => parseInt(i)),
				user.settings.get(UserSettings.Gear.Skilling)
			)
		) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each pyromancer item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Firemaking.pyromancerItems)) {
				if (user.hasItemEquippedAnywhere(parseInt(itemID))) {
					const amountToAdd = Math.floor(xpReceived * (bonus / 100));
					xpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		await user.addXP(SkillsEnum.Firemaking, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Firemaking);

		let str = `${user}, ${user.minionName} finished lighting ${quantity} ${
			Burn.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Firemaking level is now ${newLevel}!`;
		}
		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

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
						user.log(`continued trip of ${quantity}x ${Burn.name}[${Burn.inputLogs}]`);
						this.client.commands
							.get('light')!
							.run(response as KlasaMessage, [quantity, Burn.name]);
					}
				})
				.catch(noOp);
		});
	}
}
