import { Embed } from '@discordjs/builders';
import { TextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import {
	AttachmentBuilder,
	MessageOptions,
	PartialGroupDMChannel,
	PermissionsBitField,
	WebhookClient
} from 'discord.js';
import PQueue from 'p-queue';

import { prisma } from '../settings/prisma';
import { channelIsSendable } from '../util';
import { logError } from './logError';
import { splitMessage } from './splitMessage';

const webhookCache: Map<string, WebhookClient> = new Map();

export const webhookMessageCache = new Map<string, WebhookClient>();

export async function resolveChannel(channelID: string): Promise<WebhookClient | TextBasedChannelTypes | undefined> {
	const channel = globalClient.channels.cache.get(channelID);
	if (!channel || channel instanceof PartialGroupDMChannel) return undefined;
	if (channel.isDMBased()) {
		return channel;
	}
	if (!channelIsSendable(channel)) return undefined;

	const cached = webhookCache.get(channelID);
	if (cached) return cached;

	const db = await prisma.webhook.findFirst({ where: { channel_id: channelID } });
	if (db) {
		webhookCache.set(db.channel_id, new WebhookClient({ id: db.webhook_id, token: db.webhook_token }));
		return webhookCache.get(db.channel_id);
	}

	if (!channel.permissionsFor(globalClient.user!)?.has(PermissionsBitField.Flags.ManageWebhooks)) {
		return channel;
	}

	try {
		const createdWebhook = await channel.createWebhook({
			name: globalClient.user!.username,
			avatar: globalClient.user!.displayAvatarURL({})
		});
		await prisma.webhook.create({
			data: {
				channel_id: channelID,
				webhook_id: createdWebhook.id,
				webhook_token: createdWebhook.token!
			}
		});
		const webhook = new WebhookClient({ id: createdWebhook.id, token: createdWebhook.token! });
		webhookCache.set(channelID, webhook);
		return webhook;
	} catch (_) {
		return channel;
	}
}

async function deleteWebhook(channelID: string) {
	webhookCache.delete(channelID);
	await prisma.webhook.delete({ where: { channel_id: channelID } });
}

const queue = new PQueue({ concurrency: 10 });

export async function sendToChannelID(
	channelID: string,
	data: {
		content?: string;
		image?: Buffer | AttachmentBuilder;
		embed?: Embed;
		components?: MessageOptions['components'];
	}
) {
	async function queuedFn() {
		const channel = await resolveChannel(channelID);
		if (!channel) return;

		let files = data.image ? [data.image] : undefined;
		let embeds = [];
		if (data.embed) embeds.push(data.embed);
		if (channel instanceof WebhookClient) {
			try {
				await webhookSend(channel, {
					content: data.content,
					files,
					embeds,
					components: data.components
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
			}
		} else {
			await channel.send({
				content: data.content,
				files,
				embeds,
				components: data.components
			});
		}
	}
	queue.add(queuedFn);
}

async function webhookSend(channel: WebhookClient, input: MessageOptions) {
	const maxLength = 2000;

	if (input.content && input.content.length > maxLength) {
		// Moves files + components to the final message.
		const split = splitMessage(input.content, { maxLength });
		const newPayload = { ...input };
		// Separate files and components from payload for interactions
		const { files, embeds, components } = newPayload;
		delete newPayload.files;
		delete newPayload.embeds;
		delete newPayload.components;
		await webhookSend(channel, { ...newPayload, content: split[0] });

		for (let i = 1; i < split.length; i++) {
			if (i + 1 === split.length) {
				// Add files to last msg, and components for interactions to the final message.
				await webhookSend(channel, { files, embeds, content: split[i], components });
			} else {
				await webhookSend(channel, { content: split[i] });
			}
		}
		return;
	}
	const res = await channel.send({
		content: input.content,
		embeds: input.embeds,
		files: input.files,
		components: input.components,
		allowedMentions: {
			parse: ['users']
		}
	});
	webhookMessageCache.set(res.id, channel);
	return res;
}
