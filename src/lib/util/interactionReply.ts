import { ButtonInteraction, ChatInputCommandInteraction, InteractionReplyOptions } from 'discord.js';

export function interactionReply(
	interaction: ButtonInteraction | ChatInputCommandInteraction,
	response: string | InteractionReplyOptions
) {
	if (interaction.deferred) {
		return interaction.editReply(response);
	}
	return interaction.reply(response);
}

export function deferInteraction(
	interaction: ButtonInteraction | ChatInputCommandInteraction,
	options?: Parameters<ChatInputCommandInteraction['deferReply']>['0']
) {
	if (!interaction.deferred) {
		const promise = interaction.deferReply(options);
		interaction.deferred = true;
		return promise;
	}
}
