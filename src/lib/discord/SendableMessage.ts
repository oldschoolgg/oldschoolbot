import type { RawFile } from '@discordjs/rest';
import type { ButtonBuilder, EmbedBuilder } from '@oldschoolgg/discord';
import { MessageFlags, type RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v10';
import { chunk } from 'remeda';

import chatHeadImage, { type HeadKey } from '@/lib/canvas/chatHeadImage.js';
import { type MakeBankImageOptions, makeBankImage } from '@/lib/util/makeBankImage.js';

export type SendableFile = {
	name: string;
	buffer: Buffer;
};

export type BaseSendableMessage = {
	content?: string;
	components?: ButtonBuilder[];
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
export async function sendableMsgToApiCreate(msg: SendableMessage): Promise<APISendableMessage> {
	if (typeof msg === 'string') {
		return sendableMsgToApiCreate({ content: msg });
	}
	if (msg instanceof MessageBuilder) {
		// TODO: if content >2k, send as txt file
		return sendableMsgToApiCreate(await msg.build());
	}

	// TODO not sure if needed?
	// if (!('content' in response.message)) {
	// 		response.message.content = '';
	// 	}
	// 	if (!('components' in response)) {
	// 		response.message.components = [];
	// 	}

	// 	if (this.ephemeral) {
	// 		response.message.flags = MessageFlags.Ephemeral;
	// 	}

	const message: RESTPostAPIChannelMessageJSONBody = {
		content: msg.content,
		components: !msg.components
			? undefined
			: chunk(msg.components ?? [], 5).map(buttons => ({
					type: 1,
					components: buttons.map(button => button.toJSON())
				})),
		embeds: msg.embeds?.map(embed => embed.toJSON()),
		flags: msg.ephemeral ? MessageFlags.Ephemeral : undefined
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

class _MessageBuilder {
	private message: BaseSendableMessage;
	public chatHeadImagePromise?: Promise<SendableFile>;
	public bankImagePromise?: Promise<SendableFile>;

	constructor(startingMessage?: BaseSendableMessage) {
		this.message = startingMessage ?? {};
	}

	setContent(content: string): this {
		this.message.content = content;
		return this;
	}

	addContent(content: string): this {
		this.message.content += content;
		return this;
	}

	addEmbed(embed: EmbedBuilder): this {
		if (!this.message.embeds) this.message.embeds = [];
		this.message.embeds.push(embed);
		return this;
	}

	addFile(file: SendableFile): this {
		if (!this.message.files) this.message.files = [];
		this.message.files.push(file);
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
		if (!this.message.components) this.message.components = [];
		this.message.components.push(...components);
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
		return this.message;
	}
}

declare global {
	var MessageBuilder: typeof _MessageBuilder;
}

global.MessageBuilder = _MessageBuilder;
