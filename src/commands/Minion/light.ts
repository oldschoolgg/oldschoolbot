import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import {
	stringMatches,
	formatDuration,
	rand,
	itemNameFromID,
	removeItemFromBank
} from '../../lib/util';
import { SkillsEnum } from '../../lib/types';
import { Time, Activity, Tasks, Events } from '../../lib/constants';
import { FiremakingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import Firemaking from '../../lib/skills/firemaking';
import bankHasItem from '../../lib/util/bankHasItem';
import { UserSettings } from '../../lib/UserSettings';

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

		const log = Firemaking.Logs.find(
			log =>
				stringMatches(log.name, logName) || stringMatches(log.name.split(' ')[0], logName)
		);

		if (!log) {
			throw `Thats not a valid log to light. Valid logs are ${Firemaking.Logs.map(
				log => log.name
			).join(', ')}.`;
		}

		if (msg.author.skillLevel(SkillsEnum.Firemaking) < log.level) {
			throw `${msg.author.minionName} needs ${log.level} Firemaking to light ${log.name}s.`;
		}

		// All logs take 2.4s to light, add on quarter of a second to account for banking/etc.
		const timeToLightSingleLog = Time.Second * 2.4 + Time.Second / 4;

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor((Time.Minute * 30) / timeToLightSingleLog);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		// Check the user has the required logs to light.
		// Multiplying the logs required by the quantity of ashes.
		const requiredLogs: [string, number][] = Object.entries(log.inputLogs);
		for (const [logID, qty] of requiredLogs) {
			if (!bankHasItem(userBank, parseInt(logID), qty * quantity)) {
				throw `You don't have enough ${itemNameFromID(parseInt(logID))}.`;
			}
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
			logID: log.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Firemaking,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration
		};

		// Remove the logs from their bank.
		let newBank = { ...userBank };
		for (const [logID, qty] of requiredLogs) {
			if (newBank[parseInt(logID)] < qty) {
				this.client.emit(
					Events.Wtf,
					`${msg.author.sanitizedName} had insufficient logs to be removed.`
				);
				throw `What a terrible failure :(`;
			}
			newBank = removeItemFromBank(newBank, parseInt(logID), qty * quantity);
		}

		await addSubTaskToActivityTask(this.client, Tasks.SkillingTicker, data);
		await msg.author.settings.update(UserSettings.Bank, newBank);

		msg.author.incrementMinionDailyDuration(duration);
		return msg.send(
			`${msg.author.minionName} is now lighting ${quantity}x ${
				log.name
			}, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
