import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { stringMatches, formatDuration, rand } from '../../lib/util';
import { SkillsEnum } from '../../lib/types';
import { Time, Activity, Tasks } from '../../lib/constants';
import { FiremakingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import Firemaking from '../../lib/skills/firemaking';

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

	async run(msg: KlasaMessage, [quantity, logName = '']: [null | number | string, string]) {
		if (!msg.author.hasMinion) {
			throw `You dont have a minion`;
		}

		if (msg.author.minionIsBusy) {
			return msg.send(msg.author.minionStatus);
		}

		if (typeof quantity === 'string') {
			logName = quantity;
			quantity = null;
		}

		const log = Firemaking.Burnables.find(
			log =>
				stringMatches(log.name, logName) || stringMatches(log.name.split(' ')[0], logName)
		);

		if (!log) {
			throw `That's not a valid log to light. Valid logs are ${Firemaking.Burnables.map(
				log => log.name
			).join(', ')}.`;
		}

		if (msg.author.skillLevel(SkillsEnum.Firemaking) < log.level) {
			throw `${msg.author.minionName} needs ${log.level} Firemaking to light ${log.name}.`;
		}

		if (typeof quantity === 'string') {
			logName = quantity;
			quantity = null;
		}

		// All logs take 2.4s to light, add on quarter of a second to account for banking/etc.
		const timeToLightSingleLog = Time.Second * 2.4 + Time.Second / 4;

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor((Time.Minute * 30) / timeToLightSingleLog);
		}

		await msg.author.settings.sync(true);

		// Check the user has the required logs to light.
		// Multiplying the logs required by the quantity of ashes.
		const hasRequiredLogs = await msg.author.hasItem(log.inputLogs, quantity);
		if (!hasRequiredLogs) {
			throw `You dont have ${quantity}x ${log.name}.`;
		}

		const duration = quantity * timeToLightSingleLog;

		if (duration > Time.Minute * 30) {
			throw `${
				msg.author.minionName
			} can't go on trips longer than 30 minutes, try a lower quantity. The highest amount of ${
				log.name
			}s you can light is ${Math.floor((Time.Minute * 30) / timeToLightSingleLog)}.`;
		}

		const data: FiremakingActivityTaskOptions = {
			burnableID: log.inputLogs,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Firemaking,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		// Remove the logs from their bank.
		await msg.author.removeItemFromBank(log.inputLogs, quantity);

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);

		msg.author.incrementMinionDailyDuration(duration);
		return msg.send(
			`${msg.author.minionName} is now lighting ${quantity}x ${
				log.name
			}, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
