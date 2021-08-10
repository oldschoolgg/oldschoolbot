import {
	DMChannel,
	GuildMember,
	MessageAttachment,
	MessageOptions,
	MessagePayload,
	Permissions,
	TextChannel,
	User,
	Util
} from 'discord.js';
import { isObject } from 'e';
import { Extendable, ExtendableStore, KlasaMessage, KlasaUser } from 'klasa';

import { bankImageCache } from '../lib/constants';
import { ItemBank } from '../lib/types';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [TextChannel, DMChannel] });
	}

	// @ts-ignore 2784
	get attachable(this: TextChannel) {
		return (
			!this.guild ||
			(this.postable && this.permissionsFor(this.guild.me!)!.has(Permissions.FLAGS.ATTACH_FILES, false))
		);
	}

	// @ts-ignore 2784
	get embedable(this: TextChannel) {
		return (
			!this.guild ||
			(this.postable && this.permissionsFor(this.guild.me!)!.has(Permissions.FLAGS.EMBED_LINKS, false))
		);
	}

	// @ts-ignore 2784
	get postable(this: TextChannel) {
		return (
			!this.guild ||
			this.permissionsFor(this.guild.me!)!.has(
				[Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES],
				false
			)
		);
	}

	// @ts-ignore 2784
	get readable(this: TextChannel) {
		return !this.guild || this.permissionsFor(this.guild.me!)!.has(Permissions.FLAGS.VIEW_CHANNEL, false);
	}

	async send(this: TextChannel, input: string | MessageOptions): Promise<KlasaMessage> {
		const maxLength = 2000;
		if (typeof input === 'string' && input.length > maxLength) {
			let lastMessage = null;
			for (const chunk of Util.splitMessage(input, { maxLength })) {
				const sentMessage = await this.send(chunk);
				lastMessage = sentMessage;
			}
			return lastMessage!;
		}
		if (isObject(input) && input.content && input.content.length > maxLength) {
			// Moves files + components to the final message.
			const split = Util.splitMessage(input.content, { maxLength });
			const newPayload = { ...input };
			// Separate files and components from payload for interactions
			const { components, files } = newPayload;
			delete newPayload.components;
			delete newPayload.files;
			await this.send({ ...newPayload, content: split[0] });

			let lastMessage = null;
			for (let i = 1; i < split.length; i++) {
				if (i + 1 === split.length) {
					// Add files to last msg, and components for interactions to the final message.
					lastMessage = await this.send({ components, files, content: split[i] });
				} else {
					await this.send(split[i]);
				}
			}
			return lastMessage!;
		}

		if (this instanceof User || this instanceof GuildMember) {
			return this.createDM().then(dm => dm.send(input));
		}

		let messagePayload =
			input instanceof MessagePayload ? input.resolveData() : MessagePayload.create(this, input).resolveData();

		const { data, files } = await messagePayload.resolveFiles();
		// @ts-ignore 2341
		return (
			// @ts-ignore 2571
			this.client.api.channels[this.id].messages
				.post({ data, files })
				// @ts-ignore 2341
				.then(d => this.client.actions.MessageCreate.handle(d).message)
		);
	}

	async sendBankImage(
		this: TextChannel,
		{
			bank,
			content,
			title,
			background,
			flags,
			user,
			cl
		}: {
			bank: ItemBank;
			content?: string;
			title?: string;
			background?: number;
			flags?: Record<string, string>;
			user?: KlasaUser;
			cl?: ItemBank;
		}
	) {
		const { image, cacheKey, isTransparent } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(bank, title, true, { background: background ?? 1, ...flags }, user, cl);

		let cached = bankImageCache.get(cacheKey);
		if (cached) {
			console.log('Using cached bank image');
		}

		if (cached && content) {
			content += `\n${cached}`;
		}
		let options: MessageOptions = { content: content ?? cached };

		if (image && !cached) {
			options.files = [new MessageAttachment(image!, isTransparent ? 'bank.png' : 'bank.jpg')];
		}
		const sent = await this.send(options);

		const url = sent.attachments.first()?.proxyURL;
		if (url) {
			bankImageCache.set(cacheKey, url);
		}
		return sent;
	}
}
