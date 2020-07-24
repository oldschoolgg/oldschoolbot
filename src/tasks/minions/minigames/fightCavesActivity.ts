import { Task } from 'klasa';
import { Monsters } from 'oldschooljs';

import { FightCavesActivityTaskOptions } from '../../../lib/types/minions';
import { channelIsSendable } from '../../../lib/util/channelIsSendable';
import createReadableItemListFromBank from '../../../lib/util/createReadableItemListFromTuple';
import {
	calcPercentOfNum,
	calcWhatPercent,
	formatDuration,
	noOp,
	percentChance,
	rand,
	removeItemFromBank
} from '../../../lib/util';
import mejJalImage from '../../../lib/image/mejJalImage';
import itemID from '../../../lib/util/itemID';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import fightCavesSupplies from '../../../lib/minions/data/fightCavesSupplies';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { Emoji, Events } from '../../../lib/constants';
import TzTokJad from 'oldschooljs/dist/simulation/monsters/special/TzTokJad';

const TokkulID = itemID('Tokkul');
const TzrekJadPet = itemID('Tzrek-jad');

export default class extends Task {
	async run({
		userID,
		channelID,
		jadDeathChance,
		preJadDeathTime,
		duration
	}: FightCavesActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const channel = await this.client.channels.fetch(channelID).catch(noOp);

		const tokkulReward = rand(2000, 6000);
		const diedToJad = percentChance(jadDeathChance);

		const attempts = user.settings.get(UserSettings.Stats.FightCavesAttempts) ?? 0;
		await user.settings.update(UserSettings.Stats.FightCavesAttempts, attempts + 1);

		const attemptsStr = `You have tried Fight caves ${attempts + 1}x times.`;

		if (preJadDeathTime) {
			// Give back supplies based on how far in they died, for example if they
			// died 80% of the way through, give back approximately 20% of their supplies.
			const percSuppliesToRefund = 100 - calcWhatPercent(preJadDeathTime, duration);
			const itemLootBank = { [itemID('Tokkul')]: tokkulReward };

			for (const [itemID, qty] of Object.entries(fightCavesSupplies)) {
				const amount = Math.floor(calcPercentOfNum(percSuppliesToRefund, qty));
				if (amount > 0) {
					itemLootBank[parseInt(itemID)] = amount;
				}
			}

			await user.addItemsToBank(itemLootBank, true);

			if (!channelIsSendable(channel)) return;
			return channel.send(
				`${user} You died ${formatDuration(
					preJadDeathTime
				)} into your attempt. The following supplies were refunded back into your bank: ${await createReadableItemListFromBank(
					this.client,
					removeItemFromBank(itemLootBank, TokkulID, itemLootBank[TokkulID])
				)}.`,
				await mejJalImage(
					`You die before you even reach TzTok-Jad...atleast you tried, I give you ${tokkulReward}x Tokkul. ${attemptsStr}`
				)
			);
		}

		if (diedToJad) {
			await user.addItemsToBank({ [TokkulID]: tokkulReward }, true);

			if (!channelIsSendable(channel)) return;
			return channel.send(
				`${user}`,
				await mejJalImage(
					`TzTok-Jad stomp you to death...nice try though JalYt, for your effort I give you ${tokkulReward}x Tokkul. ${attemptsStr}`
				)
			);
		}

		await user.incrementMonsterScore(Monsters.TzTokJad.id);
		const loot = Monsters.TzTokJad.kill();

		if (loot[TzrekJadPet]) {
			this.client.emit(
				Events.ServerNotification,
				`**${user.username}** just received their ${formatOrdinal(
					user.getCL(TzrekJadPet) + 1
				)} ${Emoji.TzRekJad} TzRek-jad pet by killing TzTok-Jad, on their ${formatOrdinal(
					user.getKC(TzTokJad)
				)} kill!`
			);
		}

		if (user.getCL(itemID('Fire cape')) === 0) {
			this.client.emit(
				Events.ServerNotification,
				`**${user.username}** just received their first Fire cape on their ${formatOrdinal(
					attempts + 1
				)} attempt!`
			);
		}

		await user.addItemsToBank(loot, true);

		const lootText = await createReadableItemListFromBank(this.client, loot);

		if (!channelIsSendable(channel)) return;
		return channel.send(
			`${user}`,
			await mejJalImage(
				`You defeated TzTok-Jad for the ${formatOrdinal(
					user.getKC(Monsters.TzTokJad)
				)} time! I am most impressed, I give you... ${lootText}.`
			)
		);
	}
}
