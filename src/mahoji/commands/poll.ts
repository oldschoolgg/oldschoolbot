import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';

import { channelIsSendable } from '../../lib/util';
import { deferInteraction } from '../../lib/util/interactionReply';
import type { OSBMahojiCommand } from '../lib/util';

export const pollCommand: OSBMahojiCommand = {
	name: 'poll',
	description: 'Create a reaction poll.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'question',
			description: 'The poll question.',
			required: true
		}
	],
	run: async ({ interaction, options, user, channelID }: CommandRunOptions<{ question: string }>) => {
		const channel = globalClient.channels.cache.get(channelID.toString());
		if (!channelIsSendable(channel)) return { ephemeral: true, content: 'Invalid channel.' };
		await deferInteraction(interaction);
		try {
			const message = await channel.send({
				content: `**Poll from ${user.username}:** ${options.question}`,
				allowedMentions: {
					parse: []
				}
			});
			await message.react('380915244760825857');
			await message.react('380915244652036097');
			return 'Poll created. Users can click on the two reactions to vote.';
		} catch {
			return 'There was an error making the poll.';
		}
	}
};
