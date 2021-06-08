import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity, Time } from '../../lib/constants';
import { GearSetupTypes } from '../../lib/gear';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemID, randomVariation, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			description: 'Sends your minion to do the Mage Arena 2',
			examples: ['+magearena2'],
			categoryFlags: ['minion', 'minigame'],
			aliases: ['ma2']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		if (msg.author.skillLevel(SkillsEnum.Magic) < 75) {
			return msg.channel.send(`You need level 75 Magic to do the Mage Arena II.`);
		}
		if (!msg.author.collectionLog[itemID('Saradomin cape')]) {
			return msg.channel.send(
				`You need to have completed Mage Arena I before doing part II.`
			);
		}
		const duration = randomVariation(Time.Minute * 25, 3);

		const itemsNeeded = new Bank({
			'Saradomin brew(4)': 1,
			'Super restore(4)': 3,
			'Stamina potion(4)': 1,
			'Fire rune': 800,
			'Air rune': 500,
			'Blood rune': 300
		});

		if (!msg.author.owns(itemsNeeded)) {
			return msg.channel.send(
				`You don't own the needed items to do the Mage Arena II, you need: ${itemsNeeded}.`
			);
		}

		const [, foodRemoved] = await removeFoodFromUser({
			client: this.client,
			user: msg.author,
			totalHealingNeeded: 20 * 23,
			healPerAction: 20 * 23,
			activityName: 'Mage Arena II',
			attackStylesUsed: [GearSetupTypes.Mage]
		});

		const totalCost = itemsNeeded.add(foodRemoved);

		updateBankSetting(this.client, ClientSettings.EconomyStats.MageArenaCost, totalCost);

		await msg.author.removeItemsFromBank(itemsNeeded);

		await addSubTaskToActivityTask<ActivityTaskOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			type: Activity.MageArena2
		});

		return msg.send(
			`${
				msg.author.minionName
			} is now doing the Mage Arena II, it will take approximately ${formatDuration(
				duration
			)}. Removed ${totalCost} from your bank.`
		);
	}
}
