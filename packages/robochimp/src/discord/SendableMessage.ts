// import type { RawFile } from '@discordjs/rest';
// import {
// 	type ButtonBuilder,
// 	type EmbedBuilder,
// 	MessageFlags,
// 	type RESTPostAPIChannelMessageJSONBody
// } from '@oldschoolgg/discord';
// import { chunk, merge } from 'remeda';

// import type { MessageBuilderClass } from '@/lib/discord/MessageBuilder.js';

// export type SendableFile = {
// 	name: string;
// 	buffer: Buffer;
// };

// export type BaseSendableMessage = {
// 	content?: string;
// 	components?: ButtonBuilder[] | ButtonBuilder[][];
// 	messageReference?: RESTPostAPIChannelMessageJSONBody['message_reference'];
// 	embeds?: EmbedBuilder[];
// 	allowedMentions?: RESTPostAPIChannelMessageJSONBody['allowed_mentions'];
// 	files?: (SendableFile | undefined)[];
// 	ephemeral?: boolean;
// 	threadId?: string;
// 	withResponse?: boolean;
// };

// export type SendableMessage = string | BaseSendableMessage | MessageBuilderClass;

// export type APISendableMessage = { message: RESTPostAPIChannelMessageJSONBody; files: RawFile[] | null };
// function isButtonMatrix(arr: ButtonBuilder[] | ButtonBuilder[][]): arr is ButtonBuilder[][] {
// 	return Array.isArray(arr[0]);
// }

// function resolveComponents(
// 	components: BaseSendableMessage['components']
// ): RESTPostAPIChannelMessageJSONBody['components'] {
// 	if (!components || !components[0]) return [];
// 	if (isButtonMatrix(components)) {
// 		return components.map(row => ({ type: 1, components: row.map(button => button.toJSON()) }));
// 	}
// 	return chunk(components, 5).map(buttons => ({
// 		type: 1,
// 		components: buttons.map(button => button.toJSON())
// 	}));
// }

// const DEFAULT_ALLOWED_MENTIONS = { users: [], roles: [], parse: [] };

// export async function sendableMsgToApiCreate(msg: SendableMessage): Promise<APISendableMessage> {
// 	if (typeof msg === 'string') {
// 		return sendableMsgToApiCreate({ content: msg });
// 	}
// 	if (msg instanceof MessageBuilder) {
// 		// TODO: if content >2k, send as txt file
// 		return sendableMsgToApiCreate(await msg.build());
// 	}

// 	const message: RESTPostAPIChannelMessageJSONBody = {
// 		content: msg.content ?? '',
// 		components: resolveComponents(msg.components),
// 		embeds: msg.embeds?.map(embed => embed.toJSON()),
// 		flags: msg.ephemeral ? MessageFlags.Ephemeral : undefined,
// 		allowed_mentions: merge(DEFAULT_ALLOWED_MENTIONS, msg.allowedMentions ?? DEFAULT_ALLOWED_MENTIONS),
// 		message_reference: msg.messageReference
// 	};

// 	if ('files' in msg && msg.files && msg.files.length > 0) {
// 		const files: RawFile[] = [];
// 		for (const file of msg.files) {
// 			if (!file) continue;
// 			files.push({ name: file.name, data: file.buffer });
// 		}
// 		return { message, files };
// 	}
// 	return { message, files: null };
// }
