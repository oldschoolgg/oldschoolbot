import { Util } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { getGuildSettings } from '../../lib/settings/settings';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Allows you to create, remove or show tags.',
			examples: ['+tag add test Hello', '+test'],
			runIn: ['text'],
			subcommands: true,
			usage: '<add|remove|source|list|show:default> (tag:string) [content:...string]',
			usageDelim: ' ',
			categoryFlags: ['utility']
		});
		this.createCustomResolver('string', (arg, possible, message, [action]) => {
			if (action === 'list') {
				return arg;
			}
			return this.client.arguments.get('string')!.run(arg, possible, message);
		});
	}

	async add(message: KlasaMessage, [tag, content]: [string, string]) {
		const isStaff = await message.hasAtLeastPermissionLevel(6);
		if (!message.member || !isStaff) {
			return message.channel.send('You must be a staff of this server to add tags.');
		}

		if (!content || content.length === 0) {
			return message.channel.send('You must provide content for the tag.');
		}

		const settings = await getGuildSettings(message.guild!);
		if (settings.get(GuildSettings.Tags).some(_tag => _tag[0] === tag.toLowerCase())) {
			return message.channel.send('That tag already exists.');
		}
		await settings.update(GuildSettings.Tags, [...settings.get(GuildSettings.Tags), [tag.toLowerCase(), content]], {
			arrayAction: 'overwrite'
		});

		return message.channel.send(
			`Added the tag \`${message.cmdPrefix + tag}\` with content: \`\`\`${Util.escapeMarkdown(content)}\`\`\``
		);
	}

	async remove(message: KlasaMessage, [tag]: [string]) {
		const settings = await getGuildSettings(message.guild!);
		const isStaff = await message.hasAtLeastPermissionLevel(6);
		if (!message.member || !isStaff) return;
		if (!settings.get(GuildSettings.Tags).some(_tag => _tag[0] === tag.toLowerCase())) {
			return message.channel.send("That tag doesn't exist.");
		}
		const filtered = settings.get(GuildSettings.Tags).filter(([name]) => name !== tag.toLowerCase());
		await settings.update(GuildSettings.Tags, filtered, {
			arrayAction: 'overwrite'
		});
		return message.channel.send(`Removed the tag \`${tag}\`.`);
	}

	async list(message: KlasaMessage) {
		const settings = await getGuildSettings(message.guild!);
		return message.channel.send(
			`Tags for this guild are: ${settings
				.get(GuildSettings.Tags)
				.map(([name]) => name)
				.join(', ')}`
		);
	}
}
