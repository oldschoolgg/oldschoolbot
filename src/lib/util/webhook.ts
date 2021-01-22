import { MessageEmbed, TextChannel, WebhookClient } from 'discord.js';
import { KlasaClient } from 'klasa';
import PQueue from 'p-queue';

import { WebhookTable } from '../typeorm/WebhookTable.entity';
import { channelIsSendable } from './channelIsSendable';

const webhookCache: Map<string, WebhookClient> = new Map();

export async function resolveChannel(
	client: KlasaClient,
	channelID: string
): Promise<WebhookClient | TextChannel | undefined> {
	const channel = client.channels.get(channelID);
	if (!channelIsSendable(channel)) return undefined;

	const cached = webhookCache.get(channelID);
	if (cached) return cached;

	const db = await WebhookTable.findOne({ channelID });
	if (db) {
		client.emit('log', `Restoring webhook from DB.`);
		webhookCache.set(db.channelID, new WebhookClient(db.webhookID, db.webhookToken));
		return webhookCache.get(db.channelID);
	}

	try {
		client.emit('log', `Trying to create webhook.`);
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

const queue = new PQueue({ concurrency: 10 });

export async function sendToChannelID(
	client: KlasaClient,
	channelID: string,
	data: {
		content?: string;
		image?: Buffer;
		embed?: MessageEmbed;
	}
) {
	queue.add(async () => {
		const channel = await resolveChannel(client, channelID);
		if (!channel) return;

		client.emit('log', `Sending to channelID[${channelID}].`);
		let files = data.image ? [data.image] : undefined;
		if (channel instanceof WebhookClient) {
			channel.send(data.content, {
				files,
				embeds: data.embed ? [data.embed] : undefined,
				split: true
			});
		} else {
			channel.send(data.content, { files, embed: data.embed, split: true });
		}
	});
}
