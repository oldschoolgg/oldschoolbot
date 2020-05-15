import { Extendable, ExtendableStore, KlasaMessage } from 'klasa';
import { MessageAttachment, TextChannel } from 'discord.js';
import { Bank } from '../lib/types';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [TextChannel] });
	}

	async sendBankImage(
		this: KlasaMessage,
		{ bank, content, title }: { bank: Bank; content?: string; title?: string }
	) {
		const image = await this.client.tasks.get('bankImage')!.generateBankImage(bank, title);
		return this.send(content, new MessageAttachment(image));
	}
}
