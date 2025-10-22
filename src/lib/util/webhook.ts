import { channelIsSendable, splitMessage } from '@oldschoolgg/toolkit';
import {
	type AttachmentBuilder,
	type BaseMessageOptions,
	type DMChannel,
	type EmbedBuilder,
	PartialGroupDMChannel,
	PermissionsBitField,
	type TextChannel,
	WebhookClient
} from 'discord.js';

import { globalConfig } from '@/lib/constants.js';

async function resolveChannel(channelID: string): Promise<WebhookClient | TextChannel | DMChannel | undefined> {
	const channel = globalClient.channels.cache.get(channelID);
	if (!channel || channel instanceof PartialGroupDMChannel) return undefined;
	if (channel.isDMBased()) {
		if (channel.partial) return channel.fetch();
		return channel;
	}
	if (!channelIsSendable(channel)) return undefined;
	const db = await prisma.webhook.findFirst({ where: { channel_id: channelID } });
	if (db) {
		return new WebhookClient({ id: db.webhook_id, token: db.webhook_token });
	}

	if (
		!globalConfig.isProduction ||
		!channel.permissionsFor(globalClient.user!)?.has(PermissionsBitField.Flags.ManageWebhooks)
	) {
		return channel;
	}

	try {
		const createdWebhook = (await channel.createWebhook({
			name: globalClient.user?.username,
			avatar: globalClient.user?.displayAvatarURL({})
		})) as { id: string; token: string };
		await prisma.webhook.create({
			data: {
				channel_id: channelID,
				webhook_id: createdWebhook.id,
				webhook_token: createdWebhook.token!
			}
		});
		const webhook: WebhookClient = new WebhookClient({ id: createdWebhook.id, token: createdWebhook.token! });
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
	_data:
		| string
		| {
				content?: string;
				image?: Buffer | AttachmentBuilder;
				embed?: EmbedBuilder;
				files?: BaseMessageOptions['files'];
				components?: BaseMessageOptions['components'];
				allowedMentions?: BaseMessageOptions['allowedMentions'];
		  }
) {
	const data = typeof _data === 'string' ? { content: _data } : _data;
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
				Logging.logError(error, {
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

async function sendToChannelOrWebhook(
	channel: { send: (input: BaseMessageOptions) => Promise<unknown> },
	input: BaseMessageOptions
) {
	const maxLength = 2000;

	if (input.content && input.content.length > maxLength) {
		// Moves files + components to the final message.
		const split = splitMessage(input.content, { maxLength });
		if (split.length > 4) {
			Logging.logError(new Error(`Tried to send ${split.length} messages.`), {
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

	return channel.send(input);
}
