import { InteractionResponseType, MessageFlags, Routes } from 'mahoji';

export async function respondToButton(id: string, token: string, text?: string) {
	const route = Routes.interactionCallback(id, token);
	if (text) {
		return globalClient.mahojiClient.restManager.post(route, {
			body: {
				type: InteractionResponseType.ChannelMessageWithSource,
				data: { content: text, flags: MessageFlags.Ephemeral }
			}
		});
	}

	await globalClient.mahojiClient.restManager.post(route, {
		body: {
			type: InteractionResponseType.DeferredMessageUpdate
		}
	});
}
