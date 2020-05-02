import { Extendable, ExtendableStore, KlasaMessage } from 'klasa';
import { Message, MessageAttachment, TextChannel, Permissions } from 'discord.js';

import { Bank } from '../../lib/types';
import { noOp } from '../../lib/util';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Message] });
	}

	get cmdPrefix(this: KlasaMessage) {
		return this.guild ? this.guild.settings.get('prefix') : '+';
	}

	async sendLarge(
		this: KlasaMessage,
		content: any,
		fileName = 'large-response.txt',
		messageTooLong = 'Response was too long, please see text file.'
	) {
		if (content.length <= 2000 && !this.flagArgs.file) return this.send(content);

		return this.channel.sendFile(Buffer.from(content), fileName, messageTooLong);
	}

	async sendBankImage(
		this: KlasaMessage,
		{ bank, content, title }: { bank: Bank; content?: string; title?: string }
	) {
		const image = await this.client.tasks.get('bankImage')!.generateBankImage(bank, title);
		return this.send(content, new MessageAttachment(image));
	}

	removeAllReactions(this: KlasaMessage) {
		// Remove all reactions if the user has permissions to do so
		if (
			this.guild &&
			(this.channel as TextChannel)
				.permissionsFor(this.guild.me!)!
				.has(Permissions.FLAGS.MANAGE_MESSAGES)
		) {
			this.reactions.removeAll().catch(noOp);
		}
	}
}
