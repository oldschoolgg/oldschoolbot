import type { ButtonBuilder, EmbedBuilder } from '@discordjs/builders';
import type { RawFile } from '@discordjs/rest';
import type { IMessage } from '@oldschoolgg/schemas';
import { chunkArr } from '@oldschoolgg/util';
import {
	type APIAllowedMentions,
	type APIApplication,
	type APIInteraction,
	type GatewayGuildCreateDispatchData,
	type GatewayIntentBits,
	type GatewayMessageCreateDispatchData,
	type GatewayPresenceUpdateData,
	MessageFlags,
	type PresenceUpdateStatus,
	type RESTPostAPIChannelMessageJSONBody
} from 'discord-api-types/v10';
import { merge } from 'remeda';

export type SendableFile = {
	name: string;
	buffer: Buffer;
};

export type BaseSendableMessage = {
	content?: string;
	components?: ButtonBuilder[] | ButtonBuilder[][];
	messageReference?: RESTPostAPIChannelMessageJSONBody['message_reference'];
	embeds?: EmbedBuilder[];
	allowedMentions?: RESTPostAPIChannelMessageJSONBody['allowed_mentions'];
	files?: (SendableFile | undefined)[];
	ephemeral?: boolean;
	threadId?: string;
	withResponse?: boolean;
};

type AnyClassWithBuild = InstanceType<
	abstract new (
		...args: any[]
	) => {
		build(...args: any[]): Promise<SendableMessage>;
	}
>;

export type SendableMessage = string | BaseSendableMessage | AnyClassWithBuild;

export type APISendableMessage = { message: RESTPostAPIChannelMessageJSONBody; files: RawFile[] | null };
function isButtonMatrix(arr: ButtonBuilder[] | ButtonBuilder[][]): arr is ButtonBuilder[][] {
	return Array.isArray(arr[0]);
}

function resolveComponents(
	components: BaseSendableMessage['components']
): RESTPostAPIChannelMessageJSONBody['components'] {
	if (!components || !components[0]) return [];
	if (isButtonMatrix(components)) {
		return components.map(row => ({ type: 1, components: row.map(button => button.toJSON()) }));
	}
	return chunkArr(components, 5).map(buttons => ({
		type: 1,
		components: buttons.map(button => button.toJSON())
	}));
}

const DEFAULT_ALLOWED_MENTIONS: APIAllowedMentions = { users: [], roles: [], parse: [] };

export async function sendableMsgToApiCreate({
	msg,
	defaultAllowedMentions
}: {
	msg: SendableMessage;
	defaultAllowedMentions?: APIAllowedMentions;
}): Promise<APISendableMessage> {
	if (typeof msg === 'string') {
		return sendableMsgToApiCreate({ msg: { content: msg }, defaultAllowedMentions });
	}

	if ('build' in msg) {
		// TODO: if content >2k, send as txt file
		return sendableMsgToApiCreate({ msg: await msg.build(), defaultAllowedMentions });
	}

	const message: RESTPostAPIChannelMessageJSONBody = {
		content: msg.content ?? '',
		components: resolveComponents(msg.components),
		embeds: msg.embeds?.map(embed => embed.toJSON()),
		flags: msg.ephemeral ? MessageFlags.Ephemeral : undefined,
		allowed_mentions: merge(merge(DEFAULT_ALLOWED_MENTIONS, defaultAllowedMentions), msg.allowedMentions),
		message_reference: msg.messageReference
	};

	if ('files' in msg && msg.files && msg.files.length > 0) {
		const files: RawFile[] = [];
		for (const file of msg.files) {
			if (!file) continue;
			files.push({ name: file.name, data: file.buffer });
		}
		return { message, files };
	}
	return { message, files: null };
}

export interface DiscordClientEventsMap {
	interactionCreate: [interaction: APIInteraction];
	guildCreate: [guild: GatewayGuildCreateDispatchData];
	ready: [data: { application: APIApplication }];
	economyLog: [message: string];
	serverNotification: [message: string];
	error: [error: Error];
	messageCreate: [message: IMessage];
	rawMessageCreate: [message: GatewayMessageCreateDispatchData];
}

export type UserUsernameFetcher = (userId: string) => Promise<string>;

export interface DiscordClientOptions {
	isProduction: boolean;
	mainServerId: string;
	token: string;
	intents: GatewayIntentBits[];
	initialPresence: { activity: GatewayPresenceUpdateData['activities'][0]; status: PresenceUpdateStatus };
	defaultAllowedMentions?: APIAllowedMentions;
	userUsernameFetcher: UserUsernameFetcher;
}
