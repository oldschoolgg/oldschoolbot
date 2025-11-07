import type { RawFile } from '@discordjs/rest';
import {
	type ButtonBuilder,
	type EmbedBuilder,
	MessageFlags,
	type RESTPostAPIChannelMessageJSONBody
} from '@oldschoolgg/discord';
import { chunk, merge } from 'remeda';

import chatHeadImage, { type HeadKey } from '@/lib/canvas/chatHeadImage.js';
import { type MakeBankImageOptions, makeBankImage } from '@/lib/util/makeBankImage.js';

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

export type SendableMessage = string | BaseSendableMessage | _MessageBuilder;

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
	return chunk(components ?? [], 5).map(buttons => ({
		type: 1,
		components: buttons.map(button => button.toJSON())
	}));
}

const DEFAULT_ALLOWED_MENTIONS = { users: [], roles: [], parse: [] };

export async function sendableMsgToApiCreate(msg: SendableMessage): Promise<APISendableMessage> {
	if (typeof msg === 'string') {
		return sendableMsgToApiCreate({ content: msg });
	}
	if (msg instanceof MessageBuilder) {
		// TODO: if content >2k, send as txt file
		return sendableMsgToApiCreate(await msg.build());
	}

	const message: RESTPostAPIChannelMessageJSONBody = {
		content: msg.content ?? '',
		components: resolveComponents(msg.components),
		embeds: msg.embeds?.map(embed => embed.toJSON()),
		flags: msg.ephemeral ? MessageFlags.Ephemeral : undefined,
		allowed_mentions: merge(DEFAULT_ALLOWED_MENTIONS, msg.allowedMentions ?? DEFAULT_ALLOWED_MENTIONS),
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

export class _MessageBuilder {
	private _message: BaseSendableMessage;
	public chatHeadImagePromise?: Promise<SendableFile>;
	public bankImagePromise?: Promise<SendableFile>;

	constructor(startingMessage: BaseSendableMessage = {}) {
		this._message = startingMessage;
		if (!this._message.components) this._message.components = [];
		if (!this._message.content) this._message.content = '';
	}

	get message() {
		return this._message;
	}

	setContent(content: string): this {
		this._message.content = content;
		return this;
	}

	addContent(content: string): this {
		this._message.content += content;
		return this;
	}

	addEmbed(embed: EmbedBuilder): this {
		if (!this._message.embeds) this._message.embeds = [];
		this._message.embeds.push(embed);
		return this;
	}

	addFile(file: SendableFile): this {
		if (!this._message.files) this._message.files = [];
		this._message.files.push(file);
		return this;
	}

	addChatHeadImage(head: HeadKey, content: string): this {
		this.chatHeadImagePromise = chatHeadImage({ head, content });
		return this;
	}

	addBankImage(opts: MakeBankImageOptions): this {
		this.bankImagePromise = makeBankImage(opts);
		return this;
	}

	addComponents(components?: ButtonBuilder[]): this {
		if (!components) return this;
		if (!this._message.components) this._message.components = [];
		// @ts-expect-error
		this._message.components.push(...components);
		return this;
	}

	removeComponents(): this {
		this._message.components = [];
		return this;
	}

	async merge(message: _MessageBuilder | string) {
		if (typeof message === 'string') {
			this.addContent(message);
			return this;
		}
		if (message.chatHeadImagePromise) {
			this.addFile(await message.chatHeadImagePromise);
		}
		if (message.bankImagePromise) {
			this.addFile(await message.bankImagePromise);
		}
		if (message.message.components) {
			this.addComponents(message.message.components as ButtonBuilder[]);
		}
		return this;
	}

	async build(): Promise<SendableMessage> {
		if (this.chatHeadImagePromise) {
			const chatHeadImage = await this.chatHeadImagePromise;
			this.addFile(chatHeadImage);
		}
		if (this.bankImagePromise) {
			const bankImage = await this.bankImagePromise;
			this.addFile(bankImage);
		}
		return this._message;
	}
}

declare global {
	var MessageBuilder: typeof _MessageBuilder;
}

global.MessageBuilder = _MessageBuilder;
