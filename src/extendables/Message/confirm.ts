import { Message } from 'discord.js';
import { Extendable, ExtendableStore, KlasaMessage } from 'klasa';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Message] });
	}

	async confirm(this: KlasaMessage, str: string): Promise<void> {
		if (this.flagArgs.confirm || this.flagArgs.cf) return;

		const sellMsg = await this.channel.send(
			`${str}\n\nType \`confirm\` to confirm, or include \`--cf\` in your message to bypass this confirmation.`
		);

		try {
			await this.channel.awaitMessages(
				_msg =>
					_msg.author.id === this.author.id && _msg.content.toLowerCase() === 'confirm',
				{
					max: 1,
					time: 20_000,
					errors: ['time']
				}
			);
		} catch (err) {
			sellMsg.edit(`User did not confirm in time.`);
			throw 'User did not confirm in time.';
		}
	}
}
