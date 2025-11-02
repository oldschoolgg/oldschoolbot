// import {
// 	type BaseMessageOptions,
// 	channelIsSendable,
// 	type DMChannel,
// 	type EmbedBuilder,
// 	PartialGroupDMChannel,
// 	PermissionsBitField,
// 	type TextChannel,
// 	WebhookClient
// } from '@oldschoolgg/discord';
// import { splitMessage } from '@oldschoolgg/toolkit';

// import { globalConfig } from '@/lib/constants.js';

// async function resolveChannel(channelId: string): Promise<WebhookClient | TextChannel | DMChannel | undefined> {
// 	const channel = globalClient.channels.cache.get(channelId);
// 	if (!channel || channel instanceof PartialGroupDMChannel) return undefined;
// 	if (channel.isDMBased()) {
// 		if (channel.partial) return channel.fetch();
// 		return channel;
// 	}
// 	if (!channelIsSendable(channel)) return undefined;
// 	const db = await prisma.webhook.findFirst({ where: { channel_id: channelId } });
// 	if (db) {
// 		return new WebhookClient({ id: db.webhook_id, token: db.webhook_token });
// 	}

// 	if (
// 		!globalConfig.isProduction ||
// 		!channel.permissionsFor(globalClient.user!)?.has(PermissionsBitField.Flags.ManageWebhooks)
// 	) {
// 		return channel;
// 	}

// 	try {
// 		const createdWebhook = (await channel.createWebhook({
// 			name: globalClient.user?.username,
// 			avatar: globalClient.user?.displayAvatarURL({})
// 		})) as { id: string; token: string };
// 		await prisma.webhook.create({
// 			data: {
// 				channel_id: channelId,
// 				webhook_id: createdWebhook.id,
// 				webhook_token: createdWebhook.token!
// 			}
// 		});
// 		const webhook: WebhookClient = new WebhookClient({ id: createdWebhook.id, token: createdWebhook.token! });
// 		return webhook;
// 	} catch (_) {
// 		return channel;
// 	}
// }

// async function deleteWebhook(channelId: string) {
// 	await prisma.webhook.delete({ where: { channel_id: channelId } });
// }

// async function sendToChannelOrWebhook(
// 	channelId: string,
// 	_data:
// 		| string
// 		| {
// 			content?: string;
// 			embed?: EmbedBuilder;
// 			files?: BaseMessageOptions['files'];
// 			components?: BaseMessageOptions['components'];
// 			allowedMentions?: BaseMessageOptions['allowedMentions'];
// 		}
// ) {
// 	const data = typeof _data === 'string' ? { content: _data } : _data;
// 	const allowedMentions = data.allowedMentions ?? {
// 		parse: ['users']
// 	};
// 	const channel = await resolveChannel(channelId);
// 	if (!channel) return;

// 	const files = data.image ? [data.image] : data.files;
// 	const embeds = [];
// 	if (data.embed) embeds.push(data.embed);
// 	if (channel instanceof WebhookClient) {
// 		try {
// 			await sendToChannelOrWebhook(channel, {
// 				content: data.content,
// 				files,
// 				embeds,
// 				components: data.components,
// 				allowedMentions
// 			});
// 		} catch (err: any) {
// 			const error = err as Error;
// 			if (error.message === 'Unknown Webhook') {
// 				await deleteWebhook(channelId);
// 				await globalClient.sendMessage(channelId, data);
// 			} else {
// 				Logging.logError(error, {
// 					content: data.content ?? 'None',
// 					channelId
// 				});
// 			}
// 		} finally {
// 			channel.destroy();
// 		}
// 	} else {
// 		await sendToChannelOrWebhook(channel, {
// 			content: data.content,
// 			files,
// 			embeds,
// 			components: data.components,
// 			allowedMentions
// 		});
// 	}
// }

// // export async function sendToChannel(
// // 	channel: { send: (input: BaseMessageOptions) => Promise<unknown> },
// // 	input: BaseMessageOptions
// // ) {
// // 	const maxLength = 2000;

// // 	if (input.content && input.content.length > maxLength) {
// // 		// Moves files + components to the final message.
// // 		const split = splitMessage(input.content, { maxLength });
// // 		if (split.length > 4) {
// // 			Logging.logError(new Error(`Tried to send ${split.length} messages.`), {
// // 				content: `${split[0].substring(0, 120)}...`
// // 			});
// // 			return;
// // 		}
// // 		const newPayload = { ...input };
// // 		// Separate files and components from payload for interactions
// // 		const { files, embeds, components, allowedMentions } = newPayload;
// // 		newPayload.files = undefined;
// // 		newPayload.embeds = undefined;
// // 		newPayload.components = undefined;
// // 		await sendToChannelOrWebhook(channel, { ...newPayload, content: split[0] });

// // 		for (let i = 1; i < split.length; i++) {
// // 			if (i < split.length - 1) {
// // 				await sendToChannelOrWebhook(channel, { content: split[i], allowedMentions });
// // 			} else {
// // 				// Add files, embeds, and components to the final message.
// // 				await sendToChannelOrWebhook(channel, {
// // 					files,
// // 					embeds,
// // 					content: split[i],
// // 					components,
// // 					allowedMentions
// // 				});
// // 			}
// // 		}
// // 		return;
// // 	}

// // 	return channel.send(input);
// // }
