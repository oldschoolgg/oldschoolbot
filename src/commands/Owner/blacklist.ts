import { Guild, User } from 'discord.js';
import { ArrayActions, CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { BitField } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import getSupportGuild from '../../lib/util/getSupportGuild';

export default class extends BotCommand {
	public terms = ['usersAdded', 'usersRemoved', 'guildsAdded', 'guildsRemoved'];
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bitfieldsRequired: [BitField.isModerator],
			usage: '<User:user|Guild:guild|guild:str> [reason:...str]',
			usageDelim: ' ',
			guarded: true
		});
	}

	async run(msg: KlasaMessage, [userOrGuild]: [User | Guild]) {
		const type = userOrGuild instanceof User ? 'user' : 'guild';
		const key = type === 'guild' ? ClientSettings.GuildBlacklist : ClientSettings.UserBlacklist;
		const entry = this.client.settings.get(key);

		const alreadyBlacklisted = entry.includes(userOrGuild.id);

		this.client.settings.update(key, userOrGuild.id, {
			arrayAction: alreadyBlacklisted ? ArrayActions.Remove : ArrayActions.Add
		});
		const emoji = getSupportGuild(this.client).emojis.random().toString();

		return msg.send(
			`${emoji} Successfully ${alreadyBlacklisted ? 'un' : ''}blacklisted a ${type}, ${
				'name' in userOrGuild ? userOrGuild.name : userOrGuild.username
			}.`
		);
	}
}
