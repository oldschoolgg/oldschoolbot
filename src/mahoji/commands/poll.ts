import { SpecialResponse } from '@oldschoolgg/toolkit';

export const pollCommand = defineCommand({
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
	run: async ({ interaction, channelID }) => {
		const createdMessage = await interaction.reply({
			content: 'Poll created. Users can click on the two reactions to vote.',
			withResponse: true
		});
		if (!createdMessage) return 'There was an error making the poll.';
		await globalClient.reactToMsg({ channelId: channelID, messageId: createdMessage.id, emojiId: 'Happy' });
		await globalClient.reactToMsg({ channelId: channelID, messageId: createdMessage.id, emojiId: 'Sad' });
		return SpecialResponse.RespondedManually;
	}
});
