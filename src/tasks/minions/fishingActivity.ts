import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp, rand } from '../../lib/util';
import { Time } from '../../lib/constants';
import { SkillsEnum } from '../../lib/types';
import { FishingActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import Fishing from '../../lib/skills/fishing';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import itemID from '../../lib/util/itemID';
import bankHasItem from '../../lib/util/bankHasItem';
import { UserSettings } from '../../lib/UserSettings';
import { bankHasAllItemsFromBank } from '../../lib/util/bankHasAllItemsFromBank';

export default class extends Task {
	async run({ fishID, quantity, userID, channelID }: FishingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Fishing);

		const fish = Fishing.Fishies.find(fish => fish.id === fishID);

		if (!fish) return;

		let xpReceived = quantity * fish.xp;
		let bonusXP = 0;

		// If they have the entire angler outfit, give an extra 0.5% xp bonus
		if (bankHasAllItemsFromBank(user.settings.get(UserSettings.Bank), Fishing.anglerItems)) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each prospector item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Fishing.anglerItems)) {
				if (bankHasItem(user.settings.get(UserSettings.Bank), parseInt(itemID))) {
					const amountToAdd = Math.floor(xpReceived * (bonus / 100));
					xpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		await user.addXP(SkillsEnum.Fishing, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Fishing);

		let str = `${user}, ${user.minionName} finished fishing ${quantity} ${
			fish.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Fishing level is now ${newLevel}!`;
		}

		if (fish.id === itemID('Raw karambwanji')) {
			quantity *= 1 + Math.floor(user.skillLevel(SkillsEnum.Fishing) / 5);
		}
		const loot = {
			[fish.id]: quantity
		};

		// Roll for pet at 1.5x chance
		if (fish.petChance && rand(1, fish.petChance * 1.5) < quantity) {
			loot[itemID('Heron')] = 1;
			str += `\nYou have a funny feeling you're being followed...`;
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

						user.log(`continued trip of ${quantity}x ${fish.name}[${fish.id}]`);

						this.client.commands
							.get('fish')!
							.run(response as KlasaMessage, [quantity, fish.name]);
					}
				})
				.catch(noOp);
		});
	}
}
