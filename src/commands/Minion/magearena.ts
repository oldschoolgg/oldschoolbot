import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, randomVariation, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			description: 'Sends your minion to do the Mage Arena',
			examples: ['+magearena'],
			categoryFlags: ['minion', 'minigame'],
			aliases: []
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		if (msg.author.skillLevel(SkillsEnum.Magic) < 60) {
			return msg.channel.send('You need level 60 Magic to do the Mage Arena.');
		}
		const duration = randomVariation(Time.Minute * 10, 5);

		const itemsNeeded = new Bank({
			'Blood rune': 100,
			'Air rune': 500,
			'Fire rune': 500,
			'Prayer potion(4)': 2
		});

		if (!msg.author.owns(itemsNeeded)) {
			return msg.channel.send(`You don't own the needed items to do the Mage Arena, you need: ${itemsNeeded}.`);
		}

		const { foodRemoved } = await removeFoodFromUser({
			client: this.client,
			user: msg.author,
			totalHealingNeeded: 20 * 23,
			healPerAction: 20 * 23,
			activityName: 'Mage Arena',
			attackStylesUsed: ['mage']
		});

		const totalCost = itemsNeeded.clone().add(foodRemoved);

		await msg.author.removeItemsFromBank(itemsNeeded);

		updateBankSetting(this.client, ClientSettings.EconomyStats.MageArenaCost, totalCost);

		await addSubTaskToActivityTask<ActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			type: 'MageArena'
		});

		return msg.channel.send(
			`${msg.author.minionName} is now doing the Mage Arena, it will take approximately ${formatDuration(
				duration
			)}. Removed ${totalCost} from your bank.`
		);
	}
}
