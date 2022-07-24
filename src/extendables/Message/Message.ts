import { Message, Permissions, TextChannel } from 'discord.js';
import { noOp } from 'e';
import { Extendable, ExtendableStore, KlasaMessage } from 'klasa';

import { customClientOptions } from '../../config';
import chatHeadImage, { chatHeads } from '../../lib/util/chatHeadImage';
import { untrustedGuildSettingsCache } from '../../mahoji/mahojiSettings';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Message] });
	}

	// @ts-ignore 2784
	get cmdPrefix(this: KlasaMessage) {
		let defaultPrefix = customClientOptions.prefix ?? '+';
		return this.guild ? untrustedGuildSettingsCache.get(this.guild.id)?.prefix ?? defaultPrefix : defaultPrefix;
	}

	removeAllReactions(this: KlasaMessage) {
		// Remove all reactions if the user has permissions to do so
		if (
			this.guild &&
			(this.channel as TextChannel).permissionsFor(this.guild.me!)!.has(Permissions.FLAGS.MANAGE_MESSAGES)
		) {
			this.reactions.removeAll().catch(noOp);
		}
	}

	async chatHeadImage(this: KlasaMessage, head: keyof typeof chatHeads, content: string, messageContent?: string) {
		const file = await chatHeadImage({ head, content });
		this.channel.send({ files: [file], content: messageContent });
	}
}
