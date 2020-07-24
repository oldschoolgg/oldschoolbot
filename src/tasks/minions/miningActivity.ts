import { KlasaMessage, Task } from 'klasa';

import { noOp, rand, saidYes } from '../../lib/util';
import { Emoji, Events, Time } from '../../lib/constants';
import { MiningActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { roll } from 'oldschooljs/dist/util/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import Mining from '../../lib/skilling/skills/mining';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import itemID from '../../lib/util/itemID';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import hasArrayOfItemsEquipped from '../../lib/gear/functions/hasArrayOfItemsEquipped';

export default class extends Task {
	async run({ oreID, quantity, userID, channelID, duration }: MiningActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Mining);

		const ore = Mining.Ores.find(ore => ore.id === oreID);

		if (!ore) return;

		let xpReceived = quantity * ore.xp;
		let bonusXP = 0;

		// If they have the entire prospector outfit, give an extra 0.5% xp bonus
		if (
			hasArrayOfItemsEquipped(
				Object.keys(Mining.prospectorItems).map(i => parseInt(i)),
				user.settings.get(UserSettings.Gear.Skilling)
			)
		) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each prospector item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Mining.prospectorItems)) {
				if (user.hasItemEquippedAnywhere(parseInt(itemID))) {
					const amountToAdd = Math.floor(xpReceived * (bonus / 100));
					xpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		await user.addXP(SkillsEnum.Mining, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Mining);

		let str = `${user}, ${user.minionName} finished mining ${quantity} ${
			ore.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Mining level is now ${newLevel}!`;
		}

		const loot = {
			[ore.id]: quantity
		};

		// Roll for pet
		if (
			ore.petChance &&
			roll((ore.petChance - user.skillLevel(SkillsEnum.Mining) * 25) / quantity)
		) {
			loot[itemID('Rock golem')] = 1;
			str += `\nYou have a funny feeling you're being followed...`;
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Mining} **${user.username}'s** minion, ${user.minionName}, just received a Rock golem while mining ${ore.name} at level ${currentLevel} Mining!`
			);
		}

		const numberOfMinutes = duration / Time.Minute;

		if (numberOfMinutes > 10 && ore.nuggets) {
			const numberOfNuggets = rand(0, Math.floor(numberOfMinutes / 4));
			loot[12012] = numberOfNuggets;
		} else if (numberOfMinutes > 10 && ore.minerals) {
			let numberOfMinerals = 0;
			for (let i = 0; i < quantity; i++) {
				if (roll(ore.minerals)) numberOfMinerals++;
			}

			if (numberOfMinerals > 0) {
				loot[21341] = numberOfMinerals;
			}
		}

		str += `\n\nYou received: ${await createReadableItemListFromBank(this.client, loot)}.`;
		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
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

						user.log(`continued trip of ${quantity}x ${ore.name}[${ore.id}]`);

						this.client.commands
							.get('mine')!
							.run(response as KlasaMessage, [quantity, ore.name]);
					}
				})
				.catch(noOp);
		});
	}
}
