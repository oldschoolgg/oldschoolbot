import { channelIsSendable } from '@oldschoolgg/toolkit';

export const pollCommand: OSBMahojiCommand = {
	name: 'poll',
	description: 'Create a reaction poll.',
	options: [
		{
			type: 'String',
			name: 'question',
			description: 'The poll question.',
			required: true
		}
	],
	run: async ({ interaction, options, user, channelID }: CommandRunOptions<{ question: string }>) => {
		const channel = globalClient.channels.cache.get(channelID.toString());
		if (!channelIsSendable(channel)) return { ephemeral: true, content: 'Invalid channel.' };
		await interaction.defer({ ephemeral: false });
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
