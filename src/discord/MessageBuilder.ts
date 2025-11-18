import type { ButtonBuilder, EmbedBuilder } from '@oldschoolgg/discord';

import chatHeadImage, { type HeadKey } from '@/lib/canvas/chatHeadImage.js';
import { type MakeBankImageOptions, makeBankImage } from '@/lib/util/makeBankImage.js';
import { drawChestLootImage, type DrawChestLootImageOptions } from '@/lib/canvas/chestImage.js';

export class MessageBuilderClass {
	private _message: BaseSendableMessage;
	private chatHeadImagePromise?: Promise<SendableFile>;
	private bankImagePromise?: Promise<SendableFile>;
	private chestLootImagePromise?: Promise<SendableFile>;

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

	addChestLootImage(opts: DrawChestLootImageOptions): this {
		this.chestLootImagePromise = drawChestLootImage(opts);
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

	addAllowedUserMentions(userIDs: string[]): this {
		if (!this._message.allowedMentions) {
			this._message.allowedMentions = { users: [], roles: [], parse: [] };
		}
		if (!this._message.allowedMentions.users) {
			this._message.allowedMentions.users = [];
		}
		this._message.allowedMentions.users.push(
			...userIDs.filter(id => !this._message.allowedMentions!.users!.includes(id))
		);
		return this;
	}

	async merge(message: MessageBuilderClass | string) {
		if (typeof message === 'string') {
			this.addContent(message);
			return this;
		}
		if (message.chatHeadImagePromise) {
			this.addFile(await message.chatHeadImagePromise);
		}
		if (message.chestLootImagePromise) {
			this.addFile(await message.chestLootImagePromise);
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
		if (this.chestLootImagePromise) {
			this.addFile(await this.chestLootImagePromise);
		}
		return this._message;
	}
}

declare global {
	var MessageBuilder: typeof MessageBuilderClass;
}

global.MessageBuilder = MessageBuilderClass;
