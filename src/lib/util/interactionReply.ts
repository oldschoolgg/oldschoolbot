import { UserError } from '@oldschoolgg/toolkit/structures';
import type {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Interaction,
	InteractionReplyOptions,
	InteractionResponse,
	Message,
	RepliableInteraction,
	StringSelectMenuInteraction
} from 'discord.js';
import { DiscordAPIError } from 'discord.js';

import { SILENT_ERROR } from '../constants';
import { logErrorForInteraction } from './logError';

export async function interactionReply(interaction: RepliableInteraction, response: string | InteractionReplyOptions) {
	let i: Promise<InteractionResponse> | Promise<Message> | undefined = undefined;
	let method = '';

	if (interaction.replied) {
		method = 'followUp';
		i = interaction.followUp(response);
	} else if (interaction.deferred) {
		method = 'editReply';
		i = interaction.editReply(response);
	} else {
		method = 'reply';
		i = interaction.reply(response);
	}
	try {
		const result = await i;
		return result;
	} catch (e: any) {
		if (e instanceof DiscordAPIError && e.code !== 10_008) {
			// 10_008 is unknown message, e.g. if someone deletes the message before it's replied to.
			logErrorForInteraction(e, interaction, { method, response: JSON.stringify(response).slice(0, 50) });
		}
		return undefined;
	}
}

const wasDeferred = new Set();

export async function deferInteraction(
	interaction: ButtonInteraction | ChatInputCommandInteraction | StringSelectMenuInteraction,
	ephemeral = false
) {
	if (wasDeferred.size > 1000) wasDeferred.clear();
	if (!interaction.deferred && !wasDeferred.has(interaction.id)) {
		wasDeferred.add(interaction.id);
		try {
			await interaction.deferReply({ ephemeral });
		} catch (err) {
			logErrorForInteraction(err, interaction);
		}
	}
}

export async function handleInteractionError(err: unknown, interaction: Interaction) {
	// For silent errors, just return and do nothing. Users could see an error.
	if (err instanceof Error && err.message === SILENT_ERROR) return;

	// If DiscordAPIError #10008, that means someone deleted the message, we don't need to log this.
	if (err instanceof DiscordAPIError && err.code === 10_008) {
		return;
	}

	// If this isn't a UserError, its something we need to just log and know about to fix it.
	// Or if its not repliable, we should never be erroring here.
	if (!(err instanceof UserError) || !interaction.isRepliable()) {
		return logErrorForInteraction(err, interaction);
	}

	await interactionReply(interaction, err.message);
}
