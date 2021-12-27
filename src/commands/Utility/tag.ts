import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { table } from 'table';

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
			usage: '<add|remove|export>',
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

	async add(message: KlasaMessage) {
		return message.channel.send(
			'The tags feature is deprecated from Old School Bot. Please use Skyra instead for tags: <https://invite.skyra.pw/>.'
		);
	}

	async remove(message: KlasaMessage) {
		return message.channel.send(
			'The tags feature is deprecated from Old School Bot. Please use Skyra instead for tags: <https://invite.skyra.pw/>.'
		);
	}

	async export(message: KlasaMessage) {
		const settings = await getGuildSettings(message.guild!);
		const tags = settings.get(GuildSettings.Tags);
		if (tags.length === 0) return message.channel.send('This server has no tags.');

		const normalTable = table([['Name', 'Content'], ...tags]);
		return message.channel.send({
			content: 'Please save your tags, as we will be deleting them on the 31st of December',
			files: [new MessageAttachment(Buffer.from(normalTable), 'tags.txt')]
		});
	}
}
