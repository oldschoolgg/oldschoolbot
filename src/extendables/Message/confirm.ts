import { Message, MessageButton, MessageComponentInteraction } from 'discord.js';
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
			content: `${str}\n\nYou can also type \`confirm\` or \`cancel\`.`,
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
			const selection = await Promise.race([
				confirmMessage.channel.awaitMessages({
					time: Time.Second * 15,
					max: 1,
					errors: ['time'],
					filter: _msg => {
						return (
							_msg.author.id === this.author.id &&
							['confirm', 'cancel'].includes(_msg.content.toLowerCase())
						);
					}
				}),
				confirmMessage.awaitMessageComponentInteraction({
					filter: i => {
						if (i.user.id !== this.author.id) {
							i.reply({ ephemeral: true, content: 'This is not your confirmation message.' });
							return false;
						}
						return true;
					},
					time: Time.Second * 15
				})
			]);
			let response = '';
			if (selection instanceof MessageComponentInteraction) {
				response = selection.customID;
			} else {
				response = selection.entries().next().value[1].content.toUpperCase();
			}
			if (response === 'CANCEL') {
				return cancel('cancelled the confirmation');
			}
			if (response === 'CONFIRM') {
				return confirm();
			}
		} catch {
			return cancel("didn't confirm within the time limit");
		}
	}
}
