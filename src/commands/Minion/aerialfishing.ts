import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { SkillsEnum } from '../../lib/skilling/types';
import { AerialFishingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, randFloat } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			usage: '[buy|sell] [tripTime:int{1}|name:...string]',
			subcommands: true,
			cooldown: 1,
			aliases: ['aerial', 'af'],
			description:
				'Sends your minion to aerial fish, allowing you to get the angler outfit.',
			examples: ['+aerialfishing 30', '+aerialfishing buy fish sack'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [tripTime = Math.floor(msg.author.maxTripLength / Time.Minute)]: [number]) {
		await msg.author.settings.sync(true);

		if (msg.author.skillLevel(SkillsEnum.Fishing) < 43 || msg.author.skillLevel(SkillsEnum.Hunter) < 35) {
			return msg.send(`You need atleast level 35 Hunter and 43 Fishing to do Aerial fishing.`);
		}

		let tripLength = Time.Minute * tripTime;

		if (tripLength > msg.author.maxTripLength) {
			return msg.send(`${msg.author.minionName} can't go on trips longer than ${formatDuration(
				msg.author.maxTripLength
			)}, try a lower trip length. The highest amount of minutes you can send out is ${Math.floor(msg.author.maxTripLength / Time.Minute)}.`);
		}
		
		const randValue = randFloat(1.85, 2.15);
		const quantity = tripLength / (randValue * Time.Second);
		const duration = quantity * (randValue * Time.Second);

		await addSubTaskToActivityTask<AerialFishingActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.AerialFishing,
			}
		);

		return msg.send(
			`${
				msg.author.minionName
			} is now doing Aerial fishing, it will take around ${formatDuration(
				duration
			)} to finish.`
		);
	}
	/*

	@requiresMinion
	async buy(msg: KlasaMessage, [itemName = '']: [string]) {
		await msg.author.settings.sync(true);

		return;
	}

	@requiresMinion
	async sell(msg: KlasaMessage, [itemName = '']: [string]) {
		await msg.author.settings.sync(true);

		return;
	}
	*/
}
