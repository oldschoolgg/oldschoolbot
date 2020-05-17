import { Task } from 'klasa';
import { Monsters } from 'oldschooljs';

import { FightCavesActivityTaskOptions } from '../../../lib/types/minions';
import { channelIsSendable } from '../../../lib/util/channelIsSendable';
import createReadableItemListFromBank from '../../../lib/util/createReadableItemListFromTuple';
import { percentChance, rand, noOp } from '../../../lib/util';
import mejJalImage from '../../../lib/image/mejJalImage';
import itemID from '../../../lib/util/itemID';
import { UserSettings } from '../../../lib/settings/types/UserSettings';

export default class extends Task {
	async run({
		userID,
		channelID,
		jadDeathChance,
		preJadDeathChance,
		minigameID,
		duration,
		diedPreJad
	}: FightCavesActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		const channel = await this.client.channels.fetch(channelID).catch(noOp);
		const tokkulReward = rand(2000, 6000);

		const diedToJad = percentChance(jadDeathChance);

		const attempts = user.settings.get(UserSettings.Stats.FightCavesAttempts) ?? 0;
		await user.settings.update(UserSettings.Stats.FightCavesAttempts, attempts + 1);

		const attemptsStr = `You have tried Fight caves ${attempts + 1}x times.`;

		if (diedPreJad) {
			await user.addItemsToBank({ [itemID('Tokkul')]: tokkulReward });

			if (!channelIsSendable(channel)) return;
			return channel.send(
				`${user}`,
				await mejJalImage(
					`You die before you even reach TzTok-Jad...atleast you tried, I give you ${tokkulReward}x Tokkul. ${attemptsStr}`
				)
			);
		}

		if (diedToJad) {
			await user.addItemsToBank({ [itemID('Tokkul')]: tokkulReward });

			if (!channelIsSendable(channel)) return;
			return channel.send(
				`${user}`,
				await mejJalImage(
					`Nice try in the cave, for your effort I give you ${tokkulReward}x Tokkul. ${attemptsStr}`
				)
			);
		}

		const loot = Monsters.TzTokJad.kill();
		await user.addItemsToBank(loot);

		const lootText = await createReadableItemListFromBank(this.client, loot);

		if (!channelIsSendable(channel)) return;
		return channel.send(
			`${user}`,
			await mejJalImage(
				`You defeated TzTok-Jad, I am most impressed! I give you... ${lootText}.`
			)
		);
	}
}
