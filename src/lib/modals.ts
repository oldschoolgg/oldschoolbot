import { APIInteraction, APIModalSubmitInteraction, InteractionResponseType, InteractionType, Routes } from 'mahoji';

import { assert } from './util';

interface ModalListener {
	customID: string;
	run(interaction: APIModalSubmitInteraction): string;
	expiration: number;
}

const modalListeners: ModalListener[] = [];

export function addModalListener(listener: ModalListener) {
	modalListeners.push(listener);
	modalListeners.sort((a, b) => a.expiration - b.expiration);
	assert(modalListeners[0].expiration <= modalListeners[modalListeners.length - 1].expiration);
}

export async function modalInteractionHook(data: APIInteraction) {
	if (data.type !== InteractionType.ModalSubmit) return;
	async function respond(str: string) {
		const route = Routes.interactionCallback(data.id, data.token);
		await globalClient.mahojiClient.restManager.post(route, {
			body: { data: { content: str }, type: InteractionResponseType.ChannelMessageWithSource }
		});
	}
	const listener = modalListeners.find(i => i.customID === data.data.custom_id);
	if (!listener) return respond('Invalid modal.');
	const response = listener.run(data);
	respond(response);
}
