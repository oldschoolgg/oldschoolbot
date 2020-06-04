import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import Firemaking from '../../lib/skilling/skills/firemaking';
import { SkillsEnum } from '../../lib/skilling/types';
import { FiremakingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import checkActivityQuantity from '../../lib/util/checkActivityQuantity';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}] <logName:...string>',
			usageDelim: ' '
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, logName]: [number, string]) {
		await msg.author.settings.sync(true);

		const log = Firemaking.Burnables.find(
			log =>
				stringMatches(log.name, logName) || stringMatches(log.name.split(' ')[0], logName)
		);

		if (!log) {
			return msg.send(
				`That's not a valid log to light. Valid logs are ${Firemaking.Burnables.map(
					log => log.name
				).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Firemaking) < log.level) {
			return msg.send(
				`${msg.author.minionName} needs ${log.level} Firemaking to light ${log.name}.`
			);
		}

		// All logs take 2.4s to light, add on quarter of a second to account for banking/etc.
		const timeToLightSingleLog = Time.Second * 2.4 + Time.Second / 4;

		quantity = checkActivityQuantity(msg.author, quantity, timeToLightSingleLog, log.inputLogs);
		const duration = quantity * timeToLightSingleLog;

		// Remove the logs from their bank.
		await msg.author.removeItemFromBank(log.id, quantity);

		await addSubTaskToActivityTask<FiremakingActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				burnableID: log.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Firemaking
			}
		);

		return msg.send(
			`${msg.author.minionName} is now lighting ${quantity}x ${
				log.name
			}, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
