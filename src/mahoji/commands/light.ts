import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { client } from '../..';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Firemaking from '../../lib/skilling/skills/firemaking';
import { SkillsEnum } from '../../lib/skilling/types';
import { FiremakingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { OSBMahojiCommand } from '../lib/util';

export const lightCommand: OSBMahojiCommand = {
	name: 'light',
	description: 'Sends your minion to light logs to train firemaking.',
	attributes: {
		categoryFlags: ['minion', 'skilling'],
		description: 'Sends your minion to light logs to train firemaking.',
		examples: ['+light 5 logs', '+light magic logs']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'log',
			description: 'The log you wish to burn',
			required: true,
			autocomplete: async (value: string) => {
				return Firemaking.Burnables.filter(i =>
					!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
				).map(i => ({ name: i.name, value: i.name }));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The amount of logs you want to burn.',
			required: false,
			min_value: 1,
			max_value: 2000
		}
	],
	run: async ({
		channelID,
		options,
		userID
	}: CommandRunOptions<{
		log: string;
		quantity?: number;
	}>) => {
		const user = await client.fetchUser(userID.toString());
		let { log, quantity } = options;

		const logOpt = Firemaking.Burnables.find(_burnable => stringMatches(_burnable.name, log));

		if (!logOpt) {
			return `That's not a valid log to light. Valid logs are ${Firemaking.Burnables.map(log => log.name).join(
				', '
			)}.`;
		}

		if (user.skillLevel(SkillsEnum.Firemaking) < logOpt.level) {
			return `${user.minionName} needs ${logOpt.level} Firemaking to light ${logOpt.name}`;
		}

		const maxTripLength = user.maxTripLength('Firemaking');

		// All logs take 2.4s to light, add on quarter of a second to account for banking/etc.
		const timeToLightSingleLog = Time.Second * 2.4 + Time.Second / 4;

		// If no quantity provided, set it to the max.
		if (quantity === undefined) {
			const amountOfLogsOwned = user.settings.get(UserSettings.Bank)[logOpt.inputLogs];
			if (!amountOfLogsOwned || amountOfLogsOwned === 0) {
				return `You have no ${logOpt.name}`;
			}
			quantity = Math.min(Math.floor(maxTripLength / timeToLightSingleLog), amountOfLogsOwned);
		}

		// Check the user has the required logs to light.
		// Multiplying the logs required by the quantity of ashes.
		const hasRequiredLogs = user.hasItem(logOpt.inputLogs, quantity);
		if (!hasRequiredLogs) {
			return `You dont have ${quantity}x ${logOpt.name}.`;
		}

		const duration = quantity * timeToLightSingleLog;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${logOpt.name}s you can light is ${Math.floor(
				maxTripLength / timeToLightSingleLog
			)}.`;
		}

		await user.removeItemsFromBank(new Bank().add(logOpt.inputLogs, quantity));

		await addSubTaskToActivityTask<FiremakingActivityTaskOptions>({
			burnableID: logOpt.inputLogs,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Firemaking'
		});

		return `${user.minionName} is now lighting ${quantity}x ${logOpt.name}, it'll take around ${formatDuration(
			duration
		)} to finish.`;
	}
};
