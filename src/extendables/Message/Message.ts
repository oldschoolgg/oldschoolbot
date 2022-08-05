import { Message } from 'discord.js';
import { Extendable, ExtendableStore, KlasaMessage } from 'klasa';

import chatHeadImage, { chatHeads } from '../../lib/util/chatHeadImage';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Message] });
	}

	async chatHeadImage(this: KlasaMessage, head: keyof typeof chatHeads, content: string, messageContent?: string) {
		const file = await chatHeadImage({ head, content });
		this.channel.send({ files: [file], content: messageContent });
	}
}
