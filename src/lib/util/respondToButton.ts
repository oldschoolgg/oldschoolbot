import { InteractionResponseType, MessageFlags, Routes } from 'mahoji';

export async function respondToButton(id: string, token: string, text?: string, ephemeral = true) {
	const route = Routes.interactionCallback(id, token);
	if (text) {
		return globalClient.mahojiClient.restManager.post(route, {
			body: {
				type: InteractionResponseType.ChannelMessageWithSource,
				data: { content: text, flags: ephemeral ? MessageFlags.Ephemeral : undefined }
			}
		});
	}

	await globalClient.mahojiClient.restManager.post(route, {
		body: {
			type: InteractionResponseType.DeferredMessageUpdate
		}
	});
}
