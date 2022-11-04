import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	InteractionReplyOptions,
	RepliableInteraction
} from 'discord.js';

export function interactionReply(interaction: RepliableInteraction, response: string | InteractionReplyOptions) {
	if (interaction.deferred) {
		return interaction.editReply(response);
	}
	return interaction.reply(response);
}

export function deferInteraction(interaction: ButtonInteraction | ChatInputCommandInteraction) {
	if (!interaction.deferred) {
		const promise = interaction.deferReply();
		interaction.deferred = true;
		return promise;
	}
}
