import { type CommandRunOptions, formatDuration, mentionCommand } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';

import { Time, clamp } from 'e';
import { SNOWDREAM_RUNES_PER_MINUTE, allChristmasEventItems, christmasDroprates } from '../../lib/christmasEvent.js';
import type { SnoozeSpellActiveCastOptions } from '../../lib/types/minions.js';
import { Bank, itemNameFromID } from '../../lib/util.js';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask.js';
import { newChatHeadImage } from '../../lib/util/chatHeadImage.js';
import type { OSBMahojiCommand } from '../lib/util';

export const christmasCommand: OSBMahojiCommand = {
	name: 'christmas',
	description: 'The 2024 Christmas Event',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'check',
			description: 'Check your progress/information for the event',
			options: []
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'active_cast',
			description: 'Send your minion on an active snooze-spell casting trip.',
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'hours',
					description: 'How many hours to do the active cast for (1-3 hours, default 1)',
					required: false,
					min_value: 1,
					max_value: 3
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'drop_rates',
			description: 'View the droprates of items.',
			options: []
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{
		check?: {};
		drop_rates?: {};
		active_cast?: {
			hours?: number;
		};
	}>) => {
		const user = await mUserFetch(userID);

		async function img(content: string) {
			return newChatHeadImage({
				content,
				head: 'magnaboy'
			});
		}

		if (user.isIronman && !user.owns('Snowflake amulet')) {
			await user.addItemsToBank({ items: new Bank().add('Snowflake amulet', 1), collectionLog: true });
			return {
				files: [
					await img(
						'Take this Snowflake amulet, it will help you with the restrictions you chose to put on yourself!'
					)
				]
			};
		}

		if (!user.owns('Snowdream staff')) {
			return {
				content: `${mentionCommand(globalClient, 'chop')}`,
				files: [await img('You need a Snowdream staff! Chop some Snowdream logs and make one.')]
			};
		}
		if (!user.owns('Snowdream rune')) {
			return {
				content: `${mentionCommand(globalClient, 'runecraft')}`,
				files: [await img('You have no Snowdream runes! Runecraft some or buy some.')]
			};
		}

		if (options.drop_rates) {
			return `**Christmas Event 2024 Droprates**
${christmasDroprates
	.map(drop => {
		const items = drop.items.map(itemNameFromID).join(', ');
		return `**${items}**: 1 in ${drop.chancePerMinute} chance per minute (on avg: ${(drop.chancePerMinute / 60).toFixed(1)}h passive, ${(drop.chancePerMinute / 60 / 2.5).toFixed(1)}h active, ${drop.clDropRateIncrease ? `, droprate multiplied by ${drop.clDropRateIncrease} each time you get one` : ''})`;
	})
	.join('\n')}`;
		}

		if (options.check) {
			const missingEventItems = allChristmasEventItems.filter(i => !user.cl.has(i));

			return `**Christmas Event 2024**
You have...
**Snowdream runes:** ${user.bank.amount('Snowdream rune').toLocaleString()}
**Event Items:** ${allChristmasEventItems.filter(i => user.cl.has(i)).length}/${allChristmasEventItems.length} (Missing items: ${missingEventItems.length > 0 ? missingEventItems.slice(0, 8).map(itemNameFromID).join(', ') : 'None'})

View the droprates with ${mentionCommand(globalClient, 'christmas', 'drop_rates')}`;
		}

		if (options.active_cast) {
			let hours = clamp(options.active_cast.hours ?? 1, 1, 3);
			if (Number.isNaN(hours)) hours = 1;
			const duration = hours * Time.Hour;
			const minutes = Math.floor(duration / Time.Minute);
			const runesNeeded = Math.ceil(minutes * SNOWDREAM_RUNES_PER_MINUTE * 1.5);
			const cost = new Bank().add('Snowdream rune', runesNeeded);
			if (user.bank.amount('Snowdream rune') < cost.amount('Snowdream rune')) {
				return `You need ${cost.amount('Snowdream rune').toLocaleString()} Snowdream runes to cast the Snooze Spell actively for ${formatDuration(duration)}.`;
			}
			await user.removeItemsFromBank(cost);
			await addSubTaskToActivityTask<SnoozeSpellActiveCastOptions>({
				userID: user.id,
				channelID,
				duration,
				type: 'SnoozeSpellActive',
				hours
			});

			return `${user.minionName} is now casting the Snooze Spell actively for ${formatDuration(duration)}, removed ${cost}.`;
		}
		return 'Invalid options.';
	}
};
