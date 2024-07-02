import type { ModalSubmitInteraction } from 'discord.js';

import { assert } from './util';

interface ModalListener {
	customID: string;
	run(interaction: ModalSubmitInteraction): string;
	expiration: number;
}

const modalListeners: ModalListener[] = [];

export function addModalListener(listener: ModalListener) {
	modalListeners.push(listener);
	modalListeners.sort((a, b) => a.expiration - b.expiration);
	assert(modalListeners[0].expiration <= modalListeners[modalListeners.length - 1].expiration);
}

export async function modalInteractionHook(interaction: ModalSubmitInteraction) {
	const listener = modalListeners.find(i => i.customID === interaction.customId);
	if (!listener) return interaction.reply('Invalid modal.');
	const response = listener.run(interaction);
	interaction.reply(response);
}
