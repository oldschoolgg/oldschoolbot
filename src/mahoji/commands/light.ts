import { stringMatches } from '@oldschoolgg/toolkit/util';
import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import Firemaking from '../../lib/skilling/skills/firemaking';
import { SkillsEnum } from '../../lib/skilling/types';
import type { FiremakingActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import type { OSBMahojiCommand } from '../lib/util';

export const lightCommand: OSBMahojiCommand = {
	name: 'light',
	description: 'Light logs to train Firemaking.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/light name:Logs']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The logs you want to burn.',
			required: true,
			autocomplete: async (value: string) => {
				return Firemaking.Burnables.filter(i =>
					!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
				).map(i => ({
					name: i.name,
					value: i.name
				}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to burn (optional).',
			required: false,
			min_value: 1
		}
	],
	run: async ({ options, userID, channelID }: CommandRunOptions<{ name: string; quantity?: number }>) => {
		const user = await mUserFetch(userID);
		const log = Firemaking.Burnables.find(
			log => stringMatches(log.name, options.name) || stringMatches(log.name.split(' ')[0], options.name)
		);

		if (!log) return "That's not a valid log to light.";

		if (user.skillLevel(SkillsEnum.Firemaking) < log.level) {
			return `${user.minionName} needs ${log.level} Firemaking to light ${log.name}.`;
		}

		// All logs take 2.4s to light, add on quarter of a second to account for banking/etc.
		const timeToLightSingleLog = Time.Second * 2.4 + Time.Second / 4;

		const maxTripLength = calcMaxTripLength(user, 'Firemaking');

		const amountOfLogsOwned = user.bank.amount(log.inputLogs);

		let { quantity } = options;
		// If no quantity provided, set it to the max.
		if (!quantity) {
			if (!amountOfLogsOwned) return `You have no ${log.name}.`;
			quantity = Math.min(Math.floor(maxTripLength / timeToLightSingleLog), amountOfLogsOwned);
		}
		const duration = quantity * timeToLightSingleLog;

		const cost = new Bank().add(log.inputLogs, quantity);
		if (!user.owns(cost)) return `You dont have ${quantity}x ${log.name}.`;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${log.name}s you can light is ${Math.floor(
				maxTripLength / timeToLightSingleLog
			)}.`;
		}

		await transactItems({ userID: user.id, itemsToRemove: cost });

		await addSubTaskToActivityTask<FiremakingActivityTaskOptions>({
			burnableID: log.inputLogs,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Firemaking'
		});

		return `${user.minionName} is now lighting ${quantity}x ${log.name}, it'll take around ${formatDuration(
			duration
		)} to finish.`;
	}
};
