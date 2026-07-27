import type { ButtonBuilder } from '@discordjs/builders';

import { createInteractionCollector } from './interactionCollector.js';
import type { ButtonMInteraction, MInteraction } from './MInteraction.js';

export interface InteractionButtonPromptOptions {
	interaction: MInteraction;
	content: string;
	buttons: ButtonBuilder[];
	timeout?: number;
	ephemeral?: boolean;
	users?: string[];
	timeoutContent?: string;
}

export async function interactionButtonPrompt({
	interaction,
	content,
	buttons,
	timeout = 15_000,
	ephemeral = false,
	users = [interaction.userId],
	timeoutContent = 'This prompt timed out.'
}: InteractionButtonPromptOptions): Promise<ButtonMInteraction | null> {
	const buttonIds = new Set(
		buttons
			.map(button => {
				const json = button.toJSON();
				return 'custom_id' in json ? json.custom_id : null;
			})
			.filter((id): id is string => Boolean(id))
	);
	const response = await interaction.replyWithResponse({
		content: `${content}\n\nYou have ${Math.floor(timeout / 1000)} seconds to choose.`,
		components: buttons,
		ephemeral,
		allowedMentions: { users },
		withResponse: true
	});

	return new Promise<ButtonMInteraction | null>((resolve, reject) => {
		let selectedInteraction: ButtonMInteraction | null = null;
		const collector = createInteractionCollector({
			interaction,
			timeoutMs: timeout,
			users,
			channelId: interaction.channelId,
			messageId: response?.message_id,
			maxCollected: 1,
			filter: buttonInteraction =>
				Boolean(buttonInteraction.customId && buttonIds.has(buttonInteraction.customId))
		});

		collector.on('collect', buttonInteraction => {
			selectedInteraction = buttonInteraction;
			collector.stop('selected');
		});

		collector.on('end', async (_collected, reason) => {
			try {
				await interaction.reply({
					content: reason === 'selected' ? content : timeoutContent,
					components: [],
					ephemeral,
					allowedMentions: { users }
				});
				resolve(selectedInteraction);
			} catch (err) {
				reject(err);
			}
		});

		collector.on('error', err => {
			reject(err);
		});
	});
}
