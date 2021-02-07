import { Permissions } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { BitField } from '../../lib/constants';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

const typeString = (
	pre: string
) => `You didn't specify if you want to enable/disable random events for this server, or for you personally.

- If you disable it for the server, the bot will never post a random event message in your server. If it's enabled for the server, the bot will post
random events when/where it can. Example: \`${pre}randomevents enable server\`.

- If you disable it for yourself, you won't receive random events, even if the server has them enabled.  Example: \`${pre}randomevents enable user\`.

Random events are disabled for all servers, and for all users, by default - **you must enable them to get them.**`;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			runIn: ['text', 'dm'],
			usage: '[enable|disable] [type:str]',
			usageDelim: ' ',
			categoryFlags: ['settings'],
			examples: ['+randomevents enable user', '+randomevents disable server'],
			description:
				'Allows you to enable receiving random events for yourself, and your server. Disabled for everyone by default.'
		});
	}

	async run(msg: KlasaMessage, [command, type]: [string | undefined, string | undefined]) {
		if (!type || !['server', 'user'].includes(type)) {
			return msg.send(typeString(msg.cmdPrefix));
		}
		if (type === 'server') {
			if (!msg.guild) {
				return msg.send(`This isn't a server.`);
			}
			if (!msg.member!.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
				return msg.send(
					`You don't have permission to enable/disable random events for this server.`
				);
			}
		}

		const nextBool = command === 'enable' ? true : false;
		const currentStatus =
			type === 'server'
				? msg.guild!.settings.get(GuildSettings.RandomEventsEnabled)
				: msg.author.settings
						.get(UserSettings.BitField)
						.includes(BitField.EnabledRandomEvents);

		if (currentStatus === nextBool) {
			return msg.send(
				`Random events are already ${currentStatus ? 'enabled' : 'disabled'} for ${
					type === 'user' ? 'you' : 'this server'
				}.`
			);
		}

		if (type === 'server') {
			await msg.guild!.settings.update(GuildSettings.RandomEventsEnabled, nextBool);
		} else {
			await msg.author.settings.update(UserSettings.BitField, BitField.EnabledRandomEvents);
		}

		return msg.send(
			`Random events are now ${nextBool ? 'enabled' : 'disabled'} for ${
				type === 'user' ? 'you' : 'this server'
			}. Type \`${
				msg.cmdPrefix
			}randomevents\` for information on how to enable/disable it if needed.`
		);
	}
}
