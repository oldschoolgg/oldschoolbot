import { Extendable, ExtendableStore, KlasaMessage } from 'klasa';
import { MessageAttachment, TextChannel, DMChannel } from 'discord.js';

import { Bank } from '../lib/types';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [TextChannel, DMChannel] });
	}

	async sendBankImage(
		this: KlasaMessage,
		{
			bank,
			content,
			title,
			background
		}: { bank: Bank; content?: string; title?: string; background?: number }
	) {
		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(bank, title, true, { background: background ?? 1 });
		return this.send(content, new MessageAttachment(image));
	}
}
