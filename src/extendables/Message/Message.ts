import { Message, Permissions, TextChannel } from 'discord.js';
import { Extendable, ExtendableStore, KlasaMessage } from 'klasa';

import { customClientOptions } from '../../config';
import { getGuildSettingsCached } from '../../lib/settings/settings';
import { noOp } from '../../lib/util';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [Message] });
	}

	// @ts-ignore 2784
	get cmdPrefix(this: KlasaMessage) {
		let defaultPrefix = customClientOptions.prefix ?? '=';
		return this.guild ? getGuildSettingsCached(this.guild)?.get('prefix') ?? defaultPrefix : defaultPrefix;
	}

	removeAllReactions(this: KlasaMessage) {
		// Remove all reactions if the user has permissions to do so
		if (
			this.guild &&
			(this.channel as TextChannel).permissionsFor(this.guild.me!)!.has(Permissions.FLAGS.MANAGE_MESSAGES)
		) {
			this.reactions.removeAll().catch(noOp);
		}
	}
}
