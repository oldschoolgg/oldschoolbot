import { channelIsSendable } from '@oldschoolgg/toolkit/util';
import type { ButtonInteraction, Channel, ChatInputCommandInteraction, ComponentType } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionResponseType, Routes } from 'discord.js';
import { Time, noOp } from 'e';

import { SILENT_ERROR } from '../constants';
import { deferInteraction, interactionReply } from './interactionReply';
import { logErrorForInteraction } from './logError';

export async function silentButtonAck(interaction: ButtonInteraction) {
	return globalClient.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
		body: {
			type: InteractionResponseType.DeferredMessageUpdate
		}
	});
}

export async function handleMahojiConfirmation(
	interaction: ChatInputCommandInteraction,
	str: string,
	_users?: string[]
) {
	let channel: Channel | null = globalClient.channels.cache.get(interaction.channelId) ?? null;
	if (!channel) {
		channel = await globalClient.channels.fetch(interaction.channelId).catch(() => null);
	}
	if (!channelIsSendable(channel)) {
		const error = new Error('Channel for confirmation not found.');
		logErrorForInteraction(error, interaction, {
			str: str.slice(0, 200),
			users: _users?.join(',').slice(0, 20) ?? 'N/A'
		});
		throw error;
	}
	await deferInteraction(interaction);

	const users = _users ?? [interaction.user.id];
	const confirmed: string[] = [];
	const isConfirmed = () => confirmed.length === users.length;
	const confirmMessage = await channel.send({
		content: str,
		components: [
			new ActionRowBuilder<ButtonBuilder>().addComponents([
				new ButtonBuilder({
					label: 'Confirm',
					style: ButtonStyle.Primary,
					customId: 'CONFIRM'
				}),
				new ButtonBuilder({
					label: 'Cancel',
					style: ButtonStyle.Secondary,
					customId: 'CANCEL'
				})
			])
		],
		allowedMentions: {
			parse: ['users']
		}
	});

	return new Promise<void>(async (resolve, reject) => {
		const collector = confirmMessage.createMessageComponentCollector<ComponentType.Button>({
			time: Time.Second * 15
		});

		async function confirm(id: string) {
			if (confirmed.includes(id)) return;
			confirmed.push(id);
			if (!isConfirmed()) return;
			collector.stop();
			await confirmMessage.delete().catch(noOp);
			resolve();
		}

		let cancelled = false;
		const cancel = async (reason: 'time' | 'cancel') => {
			if (cancelled) return;
			cancelled = true;
			await confirmMessage.delete().catch(noOp);
			if (!interaction.replied) {
				await interactionReply(interaction, {
					content: reason === 'cancel' ? 'The confirmation was cancelled.' : 'You did not confirm in time.',
					ephemeral: true
				});
			}
			collector.stop();
			reject(new Error(SILENT_ERROR));
		};

		collector.on('collect', i => {
			const { id } = i.user;
			if (!users.includes(id)) {
				i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
				return;
			}
			if (i.customId === 'CANCEL') {
				cancel('cancel');
				return;
			}
			if (i.customId === 'CONFIRM') {
				silentButtonAck(i);
				confirm(id);
			}
		});

		collector.on('end', () => {
			if (!isConfirmed()) {
				cancel('time');
			}
		});
	});
}
