import { InteractionID } from "@/lib/InteractionID.js";
import { ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle, Routes, InteractionResponseType } from "discord-api-types/v10";

export async function interactionConfirmation(interaction: MInteraction, message:
	| string
	| ({ content: string; timeout?: number } & (
		| { ephemeral?: false; users?: string[] }
		| { ephemeral?: boolean; users?: undefined }
	))) {
	interaction.isConfirmation = true;
	if (process.env.TEST) return;
	const content = typeof message === 'string' ? message : message.content;
	// interaction.ephemeral = typeof message !== 'string' ? (message.ephemeral ?? interaction.ephemeral) : interaction.ephemeral;
	const users: string[] = typeof message !== 'string' ? (message.users ?? [interaction.userId]) : [interaction.userId];
	const timeout: number = typeof message !== 'string' ? (message.timeout ?? 15_000) : 15_000;

	const confirmRow = [
		(new ButtonBuilder()
			.setCustomId(InteractionID.Confirmation.Confirm)
			.setLabel('Confirm')
			.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId(InteractionID.Confirmation.Cancel)
				.setLabel('Cancel')
				.setStyle(ButtonStyle.Secondary))
	];

	await interaction.defer();

	await interaction.reply({
		content: `${content}\n\nYou have ${Math.floor(timeout / 1000)} seconds to confirm.`,
		components: confirmRow
	});

	const confirms = new Set();

	return new Promise<void>((resolve, reject) => {
		// interaction.interactionResponse!.
		const collector = globalClient.createInteractionCollector({
			timeoutMs: timeout
		});

		collector.on('collect', async buttonInteraction => {
			const silentAck = () =>
				globalClient.rest.post(Routes.interactionCallback(buttonInteraction.id, buttonInteraction.token), {
					body: {
						type: InteractionResponseType.DeferredMessageUpdate
					}
				});
			if (!users.includes(buttonInteraction.userId)) {
				buttonInteraction.reply({
					ephemeral: true,
					content: `This confirmation isn't for you.`
				});
				return;
			}

			// @ts-expect-error TODO
			if (buttonInteraction.customId === InteractionID.Confirmation.Cancel) {
				// If they cancel, we remove the button component, which means we can't reply to the button interaction.
				interaction.reply({ content: `The confirmation was cancelled.`, components: [] });
				collector.stop();
				reject(new Error('SILENT_ERROR'));
				return;
			}

			if (confirms.has(buttonInteraction.userId)) {
				buttonInteraction.reply({ ephemeral: true, content: `You have already confirmed.` });
				return;
			}

			confirms.add(buttonInteraction.userId);

			if (buttonInteraction.customId === InteractionID.Confirmation.Confirm) {
				silentAck();
				// All users have confirmed
				if (confirms.size === users.length) {
					collector.stop();
					resolve();
				} else {
					const unconfirmedUsernames = await Promise.all(
						users.filter(i => !confirms.has(i)).map(i => Cache.getBadgedUsername(i))
					);
					interaction.reply({
						content: `${content}\n\n${confirms.size}/${users.length} confirmed. Waiting for ${unconfirmedUsernames.join(', ')}...`,
						components: confirmRow
					});
				}
			}
		});

		collector.on('end', collected => {
			if (collected.size !== users.length) {
				interaction.reply({ content: `You ran out of time to confirm.`, components: [] });
				reject(new Error('SILENT_ERROR'));
			}
		});
	});
}
