import { Message } from 'discord.js';
import { Extendable, ExtendableStore, KlasaMessage } from 'klasa';

import { SILENT_ERROR } from '../../lib/constants';
import { DynamicButtons } from '../../lib/DynamicButtons';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Message] });
	}

	async confirm(this: KlasaMessage, str: string): Promise<void> {
		if (this.flagArgs.confirm || this.flagArgs.cf) return;

		const buttons = new DynamicButtons({
			channel: this.channel,
			usersWhoCanInteract: [this.author.id],
			contentAfterFinish: "You didn't confirm.",
			deleteAfterConfirm: true
		});
		buttons.add({
			name: 'Confirm',
			style: 'PRIMARY',
			fn: () => {}
		});
		buttons.add({
			name: 'Cancel',
			fn: () => {
				throw new Error(SILENT_ERROR);
			}
		});
		const collectedInteraction = await buttons.render({
			isBusy: this.author.isBusy,
			messageOptions: { content: str }
		});
		if (!collectedInteraction) throw new Error(SILENT_ERROR);
	}
}
