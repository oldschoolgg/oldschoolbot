import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity, Time } from '../../lib/constants';
import { GearSetupTypes } from '../../lib/gear';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, randomVariation } from '../../lib/util';
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
			aliases: [ma2]
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		if (msg.author.skillLevel(SkillsEnum.Magic) < 75) {
			return msg.channel.send(`You need level 75 Magic to do the Mage Arena 2.`);
		}
		const duration = randomVariation(Time.Minute * 20, 15);

		const itemsNeeded = new Bank({
			'Blood rune': 600,
			'Air rune': 900,
			'Fire rune': 700,
			'Saradomin brew(4)': 12,
      'Super restore(4)': 4
		});

		if (!msg.author.owns(itemsNeeded)) {
			return msg.channel.send(
				`You don't own the needed items to do the Mage Arena 2, you need: ${itemsNeeded}.`
			);
		}

		const [, foodRemoved] = await removeFoodFromUser({
			client: this.client,
			user: msg.author,
			totalHealingNeeded: 20 * 23,
			healPerAction: 20 * 23,
			activityName: 'Mage Arena 2',
			attackStylesUsed: [GearSetupTypes.Mage]
		});

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
			} is now doing the Mage Arena 2, it will take approximately ${formatDuration(
				duration
			)}. Removed ${itemsNeeded.add(foodRemoved)} from your bank.`
		);
	}
}
