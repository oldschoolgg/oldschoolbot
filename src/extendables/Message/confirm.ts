import { Message } from 'discord.js';
import { Extendable, ExtendableStore, KlasaMessage } from 'klasa';

import { SILENT_ERROR } from '../../lib/constants';
import { customMessageComponents } from '../../lib/util/customMessageComponents';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Message] });
	}

	async confirm(this: KlasaMessage, str: string): Promise<void> {
		if (this.flagArgs.confirm || this.flagArgs.cf) return;
		await new customMessageComponents()
			.addButton({
				label: 'Confirm',
				customID: 'confirm_message',
				style: 'PRIMARY',
				messageCharacter: 'c'
			})
			.addButton({
				label: 'Cancel',
				customID: 'cancel_message',
				style: 'SECONDARY',
				onClick: msg => {
					msg.edit(`${this.author} cancelled the confirmation.`);
					throw new Error(SILENT_ERROR);
				},
				messageCharacter: 'x'
			})
			.setOptions({
				chunkSize: 4,
				timeLimitMessage: `${this.author} didn't confirm within the time limit`,
				timeLimitThrows: true,
				deleteOnSuccess: true
			})
			.sendMessage({ user: this.author, channel: this.channel, data: str });
	}
}
