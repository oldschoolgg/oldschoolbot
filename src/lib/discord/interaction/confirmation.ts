import { ButtonBuilder, ButtonStyle } from '@oldschoolgg/discord';

import { InteractionID } from '@/lib/InteractionID.js';

enum StopReason {
	AllConfirmed = 'all_confirmed',
	UserCancelled = 'user_cancelled',
	Timeout = 'timeout'
}

export async function interactionConfirmation(
	interaction: MInteraction,
	message:
		| string
		| ({ content: string; timeout?: number } & (
				| { ephemeral?: false; users?: string[] }
				| { ephemeral?: boolean; users?: undefined }
		  ))
) {
	const ephemeral = typeof message !== 'string' ? (message.ephemeral ?? false) : false;
	interaction.isConfirmation = true;
	if (process.env.TEST) return;
	const content = typeof message === 'string' ? message : message.content;
	const users: string[] =
		typeof message !== 'string' ? (message.users ?? [interaction.userId]) : [interaction.userId];
	const timeout: number = typeof message !== 'string' ? (message.timeout ?? 15_000) : 15_000;

	const confirmRow: ButtonBuilder[] = [
		new ButtonBuilder()
			.setCustomId(InteractionID.Confirmation.Confirm)
			.setLabel('Confirm')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId(InteractionID.Confirmation.Cancel)
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary)
	];

	await interaction.defer({ ephemeral });

	await interaction.reply({
		content: `${content}\n\nYou have ${Math.floor(timeout / 1000)} seconds to confirm.`,
		components: confirmRow,
		ephemeral,
		allowedMentions: { users }
	});

	const confirms = new Set();

	return new Promise<void>((resolve, reject) => {
		const collector = globalClient.createInteractionCollector({
			interaction,
			timeoutMs: timeout,
			users,
			maxCollected: Infinity
		});

		collector.on('collect', async buttonInteraction => {
			if (!users.includes(buttonInteraction.userId)) {
				buttonInteraction.reply({
					ephemeral: true,
					content: `This confirmation isn't for you.`
				});
				return;
			}

			if (buttonInteraction.customId === InteractionID.Confirmation.Cancel) {
				collector.stop(StopReason.UserCancelled);
				return;
			}

			if (confirms.has(buttonInteraction.userId)) {
				buttonInteraction.reply({ ephemeral: true, content: `You have already confirmed.` });
				return;
			}

			confirms.add(buttonInteraction.userId);

			if (buttonInteraction.customId === InteractionID.Confirmation.Confirm) {
				buttonInteraction.silentButtonAck();
				// All users have confirmed
				if (confirms.size === users.length) {
					collector.stop(StopReason.AllConfirmed);
					resolve();
				} else {
					const unconfirmedUsernames = await Promise.all(
						users.filter(i => !confirms.has(i)).map(i => Cache.getBadgedUsername(i))
					);

					interaction.reply({
						content: `${content}\n\n${confirms.size}/${users.length} confirmed. Waiting for ${unconfirmedUsernames.join(', ')}...`,
						components: confirmRow,
						allowedMentions: { users }
					});
				}
			}
		});

		collector.on('end', async (collected, reason) => {
			if (reason === StopReason.AllConfirmed) return resolve();
			if (reason === StopReason.UserCancelled) {
				await interaction.reply({ content: `The confirmation was cancelled.`, components: [] });
				return reject(new Error('SILENT_ERROR'));
			}
			if (reason === StopReason.Timeout || collected.size !== users.length) {
				await interaction.reply({ content: `You ran out of time to confirm.`, components: [] });
				reject(new Error('SILENT_ERROR'));
			}
		});
	});
}
