import type { ICommand } from '@oldschoolgg/toolkit/discord-util';
import { FormattedCustomEmojiWithGroups, TwemojiRegex } from '@sapphire/discord-utilities';
import { ApplicationCommandOptionType } from 'discord.js';

import { fetchUser } from '../util.js';

export const reactCommand: ICommand = {
	name: 'react',
	description: 'Manage your mention reaction.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'add',
			description: 'Add an emoji thats reacted when you are pinged.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'emoji',
					description: 'The emoji, must be SFW, in the OSB server, or a built-in emoji.',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'remove',
			description: 'Remove your emoji reaction.',
			options: []
		}
	],
	run: async ({
		options,
		userID
	}: CommandRunOptions<{
		add?: { emoji: string };
		remove?: {};
	}>) => {
		const dbUser = await fetchUser(userID);
		if (dbUser.leagues_points_total < 30_000) {
			return 'You are not worthy. You need atleast 30,000 League Points to be able to have a reaction.';
		}
		if (options.add) {
			const parsedEmoji = FormattedCustomEmojiWithGroups.exec(options.add.emoji);
			const twemoji = TwemojiRegex.exec(options.add.emoji);

			let validatedEmojiID: string | null = null;
			// let isCustom = false;
			if (parsedEmoji?.[0]) {
				validatedEmojiID = parsedEmoji[0];
				// isCustom = true;
			} else if (twemoji?.[0]) {
				validatedEmojiID = twemoji[0];
			}

			if (validatedEmojiID === null) {
				return 'Invalid emoji.';
			}

			await roboChimpClient.user.update({
				where: {
					id: BigInt(userID)
				},
				data: {
					react_emoji_id: validatedEmojiID
				}
			});

			return "Done. If your reaction emoji isn't working, try changing it to a new one that RoboChimp can view, or a built-in emoji.";
		}
		if (options.remove) {
			await roboChimpClient.user.update({
				where: {
					id: BigInt(userID)
				},
				data: {
					react_emoji_id: null
				}
			});
			return 'Removed your reaction emoji.';
		}

		return 'HUH?';
	}
};
