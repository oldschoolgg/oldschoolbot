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
			categoryFlags: ['minion'],
			aliases: ['becomemonke', 'monkeyhunt'],
			description: 'Sends your minion to do the birthday event.',
			examples: ['+birthdayevent']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		addSubTaskToActivityTask<ActivityTaskOptions>(this.client, {
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration: Time.Minute * 20,
			type: Activity.BirthdayEvent
		});

		return msg.send(
			`${msg.author.minionName} is now doing the Birthday Event, hunting monkeys! They'll be back in 20 minutes.`
		);
	}
}
