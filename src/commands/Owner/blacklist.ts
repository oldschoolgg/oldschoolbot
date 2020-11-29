import { Guild, User } from 'discord.js';
import { ArrayActions, CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { BitField, Channel } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { toTitleCase } from '../../lib/util';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import getSupportGuild from '../../lib/util/getSupportGuild';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bitfieldsRequired: [BitField.isModerator],
			usage: '<User:user|Guild:guild> [reason:...str]',
			usageDelim: ' ',
			guarded: true
		});
	}

	async run(msg: KlasaMessage, [userOrGuild, reason = '*No reason.*']: [User | Guild, string]) {
		const type = userOrGuild instanceof User ? 'user' : 'guild';
		const key = type === 'guild' ? ClientSettings.GuildBlacklist : ClientSettings.UserBlacklist;
		const entry = this.client.settings.get(key);

		const alreadyBlacklisted = entry.includes(userOrGuild.id);

		this.client.settings.update(key, userOrGuild.id, {
			arrayAction: alreadyBlacklisted ? ArrayActions.Remove : ArrayActions.Add
		});
		const emoji = getSupportGuild(this.client).emojis.random().toString();
		const name = 'name' in userOrGuild ? userOrGuild.name : userOrGuild.username;
		const newStatus = `${alreadyBlacklisted ? 'un' : ''}blacklisted`;

		const channel = this.client.channels.get(Channel.BlacklistLogs);
		if (channelIsSendable(channel)) {
			channel.send(
				`${toTitleCase(type)} \`${name}\` was ${newStatus} by ${
					msg.author.username
				} for \`${reason}\`.`
			);
		}
		return msg.send(`${emoji} Successfully ${newStatus} ${type} ${name}.`);
	}
}
