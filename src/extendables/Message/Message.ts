import { Message, Permissions, TextChannel } from 'discord.js';
import { Extendable, ExtendableStore, KlasaMessage } from 'klasa';

import { noOp } from '../../lib/util';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Message] });
	}

	// @ts-ignore 2784
	get cmdPrefix(this: KlasaMessage) {
		return this.guild ? this.guild.settings.get('prefix') : '=';
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
