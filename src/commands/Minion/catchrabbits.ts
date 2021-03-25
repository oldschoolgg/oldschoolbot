import { CommandStore, KlasaMessage } from 'klasa';

import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			categoryFlags: ['minion']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		await addSubTaskToActivityTask<ActivityTaskOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration: Time.Minute * 20,
			type: Activity.RabbitCatching
		});

		return msg.send(
			`${msg.author.minionName} is now doing the Easter Holiday Event! They're helping catch rabbits that are terrorizing a nearby Farming competition - it'll take around 30 minutes.`
		);
	}
}
