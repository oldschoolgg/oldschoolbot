import { Message, MessageButton } from 'discord.js';
import { Time } from 'e';
import { Extendable, ExtendableStore, KlasaMessage } from 'klasa';

import { SILENT_ERROR } from '../../lib/constants';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Message] });
	}

	async confirm(this: KlasaMessage, str: string): Promise<void> {
		if (this.flagArgs.confirm || this.flagArgs.cf) return;

		const confirmMessage = await this.channel.send({
			content: str,
			components: [
				[
					new MessageButton({
						label: 'Confirm',
						style: 'PRIMARY',
						customID: 'CONFIRM'
					}),
					new MessageButton({
						label: 'Cancel',
						style: 'SECONDARY',
						customID: 'CANCEL'
					})
				]
			]
		});

		const cancel = async (reason: string) => {
			await confirmMessage.edit({ components: [], content: `${this.author} ${reason}.` });
			throw new Error(SILENT_ERROR);
		};

		async function confirm() {
			await confirmMessage.delete();
		}

		try {
			const selection = await confirmMessage.awaitMessageComponentInteraction({
				filter: i => {
					if (i.user.id !== this.author.id) {
						i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
						return false;
					}
					return true;
				},
				time: Time.Second * 15
			});
			if (selection.customID === 'CANCEL') {
				return cancel('cancelled the confirmation');
			}
			if (selection.customID === 'CONFIRM') {
				return confirm();
			}
		} catch {
			return cancel("didn't confirm within the time limit");
		}
	}
}
