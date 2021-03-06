import { MessageAttachment, MessageEmbed, Permissions, TextChannel, WebhookClient } from 'discord.js';
import { KlasaClient } from 'klasa';
import PQueue from 'p-queue';

import { WebhookTable } from '../typeorm/WebhookTable.entity';
import { channelIsSendable } from '../util';

const webhookCache: Map<string, WebhookClient> = new Map();

export async function resolveChannel(
	client: KlasaClient,
	channelID: string
): Promise<WebhookClient | TextChannel | undefined> {
	const channel = client.channels.cache.get(channelID);
	if (!channel) return undefined;
	if (channel.type === 'dm') {
		return channel as TextChannel;
	}
	if (!channelIsSendable(channel)) return undefined;

	const cached = webhookCache.get(channelID);
	if (cached) return cached;

	const db = await WebhookTable.findOne({ channelID });
	if (db) {
		client.emit('log', 'Restoring webhook from DB.');
		webhookCache.set(db.channelID, new WebhookClient(db.webhookID, db.webhookToken));
		return webhookCache.get(db.channelID);
	}

	if (!channel.permissionsFor(client.user!)?.has(Permissions.FLAGS.MANAGE_WEBHOOKS)) {
		return channel;
	}

	try {
		client.emit('log', 'Trying to create webhook.');
		const createdWebhook = await channel.createWebhook(client.user!.username, {
			avatar: client.user!.displayAvatarURL({})
		});
		await WebhookTable.insert({
			channelID,
			webhookID: createdWebhook.id,
			webhookToken: createdWebhook.token!
		});
		const webhook = new WebhookClient(createdWebhook.id, createdWebhook.token!);
		webhookCache.set(channelID, webhook);
		return webhook;
	} catch (_) {
		client.emit('log', 'Failed to create webhook');
		return channel;
	}
}

async function deleteWebhook(channelID: string) {
	webhookCache.delete(channelID);
	await WebhookTable.delete({ channelID });
}

const queue = new PQueue({ concurrency: 10 });

export async function sendToChannelID(
	client: KlasaClient,
	channelID: string,
	data: {
		content?: string;
		image?: Buffer | MessageAttachment;
		embed?: MessageEmbed;
	}
) {
	queue.add(async () => {
		const channel = await resolveChannel(client, channelID);
		if (!channel) return;

		client.emit('log', `Sending to channelID[${channelID}].`);
		let files = data.image ? [data.image] : undefined;
		let embeds = [];
		if (data.embed) embeds.push(data.embed);
		if (channel instanceof WebhookClient) {
			try {
				await channel.send({
					content: data.content,
					files,
					embeds
				});
			} catch (err: any) {
				const error = err as Error;
				if (error.message === 'Unknown Webhook') {
					await deleteWebhook(channelID);
					await sendToChannelID(client, channelID, data);
				}
			}
		} else {
			await channel.send({
				content: data.content,
				files,
				embeds
			});
		}
	});
}
