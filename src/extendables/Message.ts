import { Extendable, ExtendableStore, KlasaMessage, KlasaUser } from 'klasa';
import { Permissions, TextChannel } from 'discord.js';

import { Emoji, Time, Events } from '../lib/constants';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [KlasaMessage] });
	}

	public async askBoolean(this: KlasaMessage, personToAsk: KlasaUser) {
		await this.react(Emoji.Yes);
		const reactions = await this.awaitReactions(
			(reaction, user) => {
				return user === personToAsk && reaction.emoji.toString() === Emoji.Yes;
			},
			{
				time: Time.Second * 30,
				max: 1
			}
		);

		this.removeAllReactions();

		return Boolean(reactions.size) && reactions.firstKey() === Emoji.Yes;
	}

	removeAllReactions(this: KlasaMessage) {
		// Remove all reactions if the user has permissions to do so
		if (
			this.guild &&
			(this.channel as TextChannel)
				.permissionsFor(this.guild.me!)!
				.has(Permissions.FLAGS.MANAGE_MESSAGES)
		) {
			this.reactions.removeAll().catch(error => this.client.emit(Events.Warn, error));
		}
	}
}
