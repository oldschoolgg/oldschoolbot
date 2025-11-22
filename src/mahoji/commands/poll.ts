import { SpecialResponse } from '@oldschoolgg/discord';

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
	run: async ({ interaction, channelId }) => {
		const createdMessage = await interaction.replyWithResponse({
			content: 'Poll created. Users can click on the two reactions to vote.'
		});
		const messageId = createdMessage!.message_id;
		await globalClient.reactToMsg({ channelId: channelId, messageId, emojiId: 'Happy' });
		await globalClient.reactToMsg({ channelId: channelId, messageId, emojiId: 'Sad' });
		return SpecialResponse.RespondedManually;
	}
});
