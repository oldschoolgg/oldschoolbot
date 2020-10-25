import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Firemaking from '../../lib/skilling/skills/firemaking';
import { SkillsEnum } from '../../lib/skilling/types';
import { FiremakingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

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

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, logName = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			logName = quantity;
			quantity = null;
		}

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

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			const amountOfLogsOwned = msg.author.settings.get(UserSettings.Bank)[log.inputLogs];
			if (!amountOfLogsOwned || amountOfLogsOwned === 0) {
				return msg.send(`You have no ${log.name}.`);
			}
			quantity = Math.min(
				Math.floor(msg.author.maxTripLength / timeToLightSingleLog),
				amountOfLogsOwned
			);
		}

		// Check the user has the required logs to light.
		// Multiplying the logs required by the quantity of ashes.
		const hasRequiredLogs = await msg.author.hasItem(log.inputLogs, quantity);
		if (!hasRequiredLogs) {
			return msg.send(`You dont have ${quantity}x ${log.name}.`);
		}

		const duration = quantity * timeToLightSingleLog;

		if (duration > msg.author.maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					msg.author.maxTripLength
				)}, try a lower quantity. The highest amount of ${
					log.name
				}s you can light is ${Math.floor(msg.author.maxTripLength / timeToLightSingleLog)}.`
			);
		}

		// Remove the logs from their bank.
		await msg.author.removeItemFromBank(log.inputLogs, quantity);

		await addSubTaskToActivityTask<FiremakingActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				burnableID: log.inputLogs,
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
