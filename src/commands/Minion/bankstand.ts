import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { rand } from '../../lib/util';
import { Activity, Tasks, Time } from '../../lib/constants';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { BankStandingActivityTaskOptions } from '../../lib/types/minions';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (!msg.author.hasMinion) {
			throw `You dont have a minion`;
		}

		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}
		if (quantity === null) {
			quantity = Math.floor(msg.author.maxTripLength);
		}
		const duration = quantity * Time.Minute;

		if (duration > msg.author.maxTripLength) {
			return msg.send(`Pay up if u want to bankstand for longer`);
		}

		const data: BankStandingActivityTaskOptions = {
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.BankStanding,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
		msg.author.incrementMinionDailyDuration(duration);

		const response = `${msg.author.minionName} is now bankstanding at ${name} bank. It will take ${quantity} minutes to finish.`;

		return msg.send(response);
	}
}
