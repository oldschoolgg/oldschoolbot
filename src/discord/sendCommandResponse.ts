import type { BaseSendableMessage, SendableMessage } from '@oldschoolgg/discord';

import { splitSendableMessage } from '@/discord/splitSendableMessage.js';
import { resolveBotSendableMessage } from '@/discord/utils.js';

export async function sendCommandResponse(interaction: OSInteraction, response: SendableMessage): Promise<void> {
	const extraSettings = await Cache.getExtraSettings();
	let message = await resolveBotSendableMessage(response);
	const acknowledged = interaction.replied || interaction.deferred;
	const initialEphemeral = acknowledged && interaction.ephemeral;
	const ephemeral = message.ephemeral === true || (initialEphemeral && extraSettings.return_ephemeral === 'default');
	const visibilityMatches = !acknowledged || ephemeral === initialEphemeral;
	const edit = acknowledged && extraSettings.edit_reply === 'edit' && visibilityMatches;

	if (edit && initialEphemeral && message.ephemeral !== true && (message.content?.length ?? 0) > 2000) {
		message = {
			...message,
			content: 'The result was too long (over 2000 characters), please read the attached file.',
			files: [...(message.files ?? []), { name: 'result.txt', buffer: Buffer.from(message.content!) }],
			ephemeral: true
		};
	}

	message = { ...message, ephemeral };
	const parts = splitSendableMessage(message);
	if (!acknowledged || edit) {
		await interaction.reply(parts.shift()!);
	} else if (interaction.deferred && !interaction.replied) {
		await interaction.reply({
			content: ephemeral ? 'Results follow privately.' : 'Results follow.',
			ephemeral: initialEphemeral
		});
	}

	for (const part of parts) {
		await sendPart(interaction, part, extraSettings.return_behavior, ephemeral);
	}
}

async function sendPart(
	interaction: OSInteraction,
	part: BaseSendableMessage,
	behavior: 'prefer_webhooks' | 'prefer_followUps',
	ephemeral: boolean
): Promise<void> {
	if (!ephemeral && behavior === 'prefer_webhooks') {
		const sent = await globalClient.sendToWebhook(interaction.channelId, part).catch(err => {
			Logging.logError(err as Error);
			return null;
		});
		if (sent) return;
	}
	try {
		await interaction.followUp(part);
		return;
	} catch (err) {
		Logging.logError(err as Error);
		if (ephemeral) throw err;
	}
	if (behavior === 'prefer_followUps') {
		const sent = await globalClient.sendMessageOrWebhook(interaction.channelId, part);
		if (!sent) throw new Error('Could not deliver command response.');
	} else {
		await globalClient.sendMessage(interaction.channelId, part);
	}
}
