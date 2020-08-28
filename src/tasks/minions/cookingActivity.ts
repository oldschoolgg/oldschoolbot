import { Task, KlasaMessage } from 'klasa';

import { saidYes, noOp, roll, multiplyBank } from '../../lib/util';
import { Time } from '../../lib/constants';
import { CookingActivityTaskOptions } from '../../lib/types/minions';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import Cooking from '../../lib/skilling/skills/cooking';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { SkillsEnum } from '../../lib/skilling/types';
import calcBurntCookables from '../../lib/skilling/functions/calcBurntCookables';
import itemID from '../../lib/util/itemID';
import { getRandomMysteryBox } from '../../lib/openables';

export default class extends Task {
	async run({ cookableID, quantity, userID, channelID, duration }: CookingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Cooking);

		const cookable = Cooking.Cookables.find(cookable => cookable.id === cookableID);
		if (!cookable) return;

		let burnedAmount = 0;
		let stopBurningLvl = 0;

		if (
			cookable.stopBurnAtCG > 1 &&
			user.hasItemEquippedAnywhere(itemID('Cooking gauntlets'))
		) {
			stopBurningLvl = cookable.stopBurnAtCG;
		} else {
			stopBurningLvl = cookable.stopBurnAt;
		}

		burnedAmount = calcBurntCookables(
			quantity,
			stopBurningLvl,
			user.skillLevel(SkillsEnum.Cooking)
		);

		const xpReceived = (quantity - burnedAmount) * cookable.xp;

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

		if (burnedAmount > 0) {
			str += `\n\n${burnedAmount}x ${cookable.name} failed to cook.`;
		}

		let loot = {
			[cookable.id]: quantity - burnedAmount
		};
		if (roll(10)) {
			if (duration > Time.Minute * 10) {
				loot = multiplyBank(loot, 2);
				loot[getRandomMysteryBox()] = 1;
			}
		}

		loot[cookable.burntCookable] = burnedAmount;

		const minutesInTrip = Math.ceil(duration / 1000 / 60);
		for (let i = 0; i < minutesInTrip; i++) {
			if (roll(3000)) {
				loot[itemID('Remy')] = 1;
				str += `\n<:remy:748491189925183638> A small rat notices you cooking, and tells you you're cooking it all wrong! He crawls into your bank to help you with your cooking. You can equip Remy for a boost to your cooking skills.`;
				break;
			}
		}

		str += `\nYou received: ${await createReadableItemListFromBank(this.client, loot)}.`;

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

					user.log(`continued trip of ${quantity}x ${cookable.name}[${cookable.id}]`);

					this.client.commands
						.get('cook')!
						.run(response as KlasaMessage, [quantity, cookable.name]);
				}
			})
			.catch(noOp);
	}
}
