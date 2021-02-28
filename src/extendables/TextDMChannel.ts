import { DMChannel, MessageAttachment, TextChannel } from 'discord.js';
import { Extendable, ExtendableStore, KlasaUser } from 'klasa';

import { ItemBank } from './../lib/types/index';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [TextChannel, DMChannel] });
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
		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				bank,
				title,
				true,
				{ background: background ?? 1, ...flags },
				user,
				cl
			);
		return this.send(content, new MessageAttachment(image));
	}
}
