import type {
	BaseSendableMessage,
	ButtonBuilder,
	EmbedBuilder,
	SendableFile,
	SendableMessage
} from '@oldschoolgg/discord';

export class MessageBuilderClass {
	private _message: BaseSendableMessage;

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

	async build(): Promise<SendableMessage> {
		return this._message;
	}
}

declare global {
	var MessageBuilder: typeof MessageBuilderClass;
}

global.MessageBuilder = MessageBuilderClass;
