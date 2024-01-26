import { UserError } from '@oldschoolgg/toolkit/dist/lib/UserError';
import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	DiscordAPIError,
	Interaction,
	InteractionReplyOptions,
	InteractionResponse,
	Message,
	RepliableInteraction
} from 'discord.js';

import { SILENT_ERROR } from '../constants';
import { logErrorForInteraction } from './logError';

export async function interactionReply(interaction: RepliableInteraction, response: string | InteractionReplyOptions) {
	let i: Promise<InteractionResponse> | Promise<Message> | undefined = undefined;
	if (interaction.replied) {
		i = interaction.followUp(response);
	} else if (interaction.deferred) {
		i = interaction.editReply(response);
	} else {
		i = interaction.reply(response);
	}
	try {
		await i;
		return i;
	} catch (e: any) {
		if (e instanceof DiscordAPIError && e.code !== 10_008) {
			// 10_008 is unknown message, e.g. if someone deletes the message before it's replied to.
			logErrorForInteraction(e, interaction);
		}
		return undefined;
	}
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

	await interactionReply(interaction, err.message);
}
