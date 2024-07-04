import type { ModalSubmitInteraction } from 'discord.js';

interface ModalListener {
	customID: string;
	run(interaction: ModalSubmitInteraction): string;
	expiration: number;
}

const modalListeners: ModalListener[] = [];

export async function modalInteractionHook(interaction: ModalSubmitInteraction) {
	const listener = modalListeners.find(i => i.customID === interaction.customId);
	if (!listener) return interaction.reply('Invalid modal.');
	const response = listener.run(interaction);
	interaction.reply(response);
}
