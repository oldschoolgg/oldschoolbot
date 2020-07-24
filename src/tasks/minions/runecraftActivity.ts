import { KlasaMessage, Task } from 'klasa';

import { noOp, roll, saidYes } from '../../lib/util';
import { Emoji, Events, Time } from '../../lib/constants';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import Runecraft, { RunecraftActivityTaskOptions } from '../../lib/skilling/skills/runecraft';
import { calcMaxRCQuantity } from '../../lib/skilling/functions/calcMaxRCQuantity';
import { SkillsEnum } from '../../lib/skilling/types';
import itemID from '../../lib/util/itemID';

export default class extends Task {
	async run({
		runeID,
		essenceQuantity,
		userID,
		channelID,
		duration
	}: RunecraftActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Runecraft);

		const rune = Runecraft.Runes.find(_rune => _rune.id === runeID);

		if (!rune) return;
		const quantityPerEssence = calcMaxRCQuantity(rune, user);
		const runeQuantity = essenceQuantity * quantityPerEssence;

		const xpReceived = essenceQuantity * rune.xp;

		await user.addXP(SkillsEnum.Runecraft, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Runecraft);

		let str = `${user}, ${user.minionName} finished crafting ${runeQuantity} ${
			rune.name
		}, you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Runecraft level is now ${newLevel}!`;
		}

		const loot = {
			[rune.id]: runeQuantity
		};

		if (roll((1_795_758 - user.skillLevel(SkillsEnum.Runecraft) * 25) / essenceQuantity)) {
			loot[itemID('Rift guardian')] = 1;
			str += `\nYou have a funny feeling you're being followed...`;
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.Runecraft} **${user.username}'s** minion, ${user.minionName}, just received a Rift guardian while crafting ${rune.name}s at level ${currentLevel} Runecrafting!`
			);
		}

		str += `\n\nYou received: ${await createReadableItemListFromBank(this.client, loot)}.`;

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

						user.log(`continued trip of ${runeQuantity}x ${rune.name}[${rune.id}]`);

						this.client.commands
							.get('rc')!
							.run(response as KlasaMessage, [essenceQuantity, rune.name]);
					}
				})
				.catch(noOp);
		});
	}
}
