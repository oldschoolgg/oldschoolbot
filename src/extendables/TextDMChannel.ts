import { DMChannel, MessageAttachment, TextChannel } from 'discord.js';
import { Extendable, ExtendableStore, KlasaUser } from 'klasa';

import { bankImageCache } from '../lib/constants';
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
		const { image, cacheKey } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				bank,
				title,
				true,
				{ background: background ?? 1, ...flags },
				user,
				cl
			);

		let cached = bankImageCache.get(cacheKey);
		if (cached) {
			console.log('Using cached bank image');
		}

		if (cached && content) {
			content += `\n${cached}`;
		}
		const sent = await this.send(
			content ?? cached,
			image && !cached ? new MessageAttachment(image!) : undefined
		);

		const url = sent.attachments.first()?.proxyURL;
		if (url) {
			bankImageCache.set(cacheKey, url);
		}
		return sent;
	}
}
