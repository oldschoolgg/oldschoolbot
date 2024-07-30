import { splitMessage } from '@oldschoolgg/toolkit';
import type { AttachmentBuilder, BaseMessageOptions, EmbedBuilder, Message } from 'discord.js';
import { PartialGroupDMChannel, PermissionsBitField, WebhookClient } from 'discord.js';

import { production } from '../../config';

import { channelIsSendable } from '../util';
import { logError } from './logError';

async function resolveChannel(channelID: string): Promise<WebhookClient | Message['channel'] | undefined> {
	const channel = globalClient.channels.cache.get(channelID);
	if (!channel || channel instanceof PartialGroupDMChannel) return undefined;
	if (channel.isDMBased()) return channel;
	if (!channelIsSendable(channel)) return undefined;
	const db = await prisma.webhook.findFirst({ where: { channel_id: channelID } });
	if (db) {
		return new WebhookClient({ id: db.webhook_id, token: db.webhook_token });
	}

	if (!production || !channel.permissionsFor(globalClient.user!)?.has(PermissionsBitField.Flags.ManageWebhooks)) {
		return channel;
	}

	try {
		const createdWebhook = await channel.createWebhook({
			name: globalClient.user?.username,
			avatar: globalClient.user?.displayAvatarURL({})
		});
		await prisma.webhook.create({
			data: {
				channel_id: channelID,
				webhook_id: createdWebhook.id,
				webhook_token: createdWebhook.token!
			}
		});
		const webhook = new WebhookClient({ id: createdWebhook.id, token: createdWebhook.token! });
		return webhook;
	} catch (_) {
		return channel;
	}
}

async function deleteWebhook(channelID: string) {
	await prisma.webhook.delete({ where: { channel_id: channelID } });
}

export async function sendToChannelID(
	channelID: string,
	data: {
		content?: string;
		image?: Buffer | AttachmentBuilder;
		embed?: EmbedBuilder;
		files?: BaseMessageOptions['files'];
		components?: BaseMessageOptions['components'];
		allowedMentions?: BaseMessageOptions['allowedMentions'];
	}
) {
	const allowedMentions = data.allowedMentions ?? {
		parse: ['users']
	};
	const channel = await resolveChannel(channelID);
	if (!channel) return;

	const files = data.image ? [data.image] : data.files;
	const embeds = [];
	if (data.embed) embeds.push(data.embed);
	if (channel instanceof WebhookClient) {
		try {
			await sendToChannelOrWebhook(channel, {
				content: data.content,
				files,
				embeds,
				components: data.components,
				allowedMentions
			});
		} catch (err: any) {
			const error = err as Error;
			if (error.message === 'Unknown Webhook') {
				await deleteWebhook(channelID);
				await sendToChannelID(channelID, data);
			} else {
				logError(error, {
					content: data.content ?? 'None',
					channelID
				});
			}
		} finally {
			channel.destroy();
		}
	} else {
		await sendToChannelOrWebhook(channel, {
			content: data.content,
			files,
			embeds,
			components: data.components,
			allowedMentions
		});
	}
}

async function sendToChannelOrWebhook(channel: WebhookClient | Message['channel'], input: BaseMessageOptions) {
	const maxLength = 2000;

	if (input.content && input.content.length > maxLength) {
		// Moves files + components to the final message.
		const split = splitMessage(input.content, { maxLength });
		if (split.length > 4) {
			logError(new Error(`Tried to send ${split.length} messages.`), undefined, {
				content: `${split[0].substring(0, 120)}...`
			});
			return;
		}
		const newPayload = { ...input };
		// Separate files and components from payload for interactions
		const { files, embeds, components, allowedMentions } = newPayload;
		newPayload.files = undefined;
		newPayload.embeds = undefined;
		newPayload.components = undefined;
		await sendToChannelOrWebhook(channel, { ...newPayload, content: split[0] });

		for (let i = 1; i < split.length; i++) {
			if (i < split.length - 1) {
				await sendToChannelOrWebhook(channel, { content: split[i], allowedMentions });
			} else {
				// Add files, embeds, and components to the final message.
				await sendToChannelOrWebhook(channel, {
					files,
					embeds,
					content: split[i],
					components,
					allowedMentions
				});
			}
		}
		return;
	}

	const res = await channel.send(input);

	return res;
}
