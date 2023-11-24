import { UserError } from '@oldschoolgg/toolkit/dist/lib/UserError';
import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Interaction,
	InteractionReplyOptions,
	RepliableInteraction
} from 'discord.js';

import { SILENT_ERROR } from '../constants';
import { logErrorForInteraction } from './logError';

export function interactionReply(interaction: RepliableInteraction, response: string | InteractionReplyOptions) {
	if (interaction.replied) {
		return interaction.followUp(response);
	}
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

export async function handleInteractionError(err: unknown, interaction: Interaction) {
	// For silent errors, just return and do nothing. Users could see an error.
	if (err instanceof Error && err.message === SILENT_ERROR) return;

	// If this isn't a UserError, its something we need to just log and know about to fix it.
	// Or if its not repliable, we should never be erroring here.
	if (!(err instanceof UserError) || !interaction.isRepliable()) {
		return logErrorForInteraction(err, interaction);
	}

	// If it can be replied too, and hasn't been replied too, reply with the error.
	// If it has already been replied too, log the UserError so we can know where this mix-up is coming from.
	if (interaction.replied) {
		return logErrorForInteraction(
			new Error(`Tried to respond with '${err.message}' to this interaction, but it was already replied too.`),
			interaction
		);
	}

	await interactionReply(interaction, err.message);
}
