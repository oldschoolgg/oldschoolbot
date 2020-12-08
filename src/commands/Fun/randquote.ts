import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns a random message from someone in the channel.',
			examples: ['+randquote'],
			cooldown: 10,
			requiredPermissions: ['READ_MESSAGE_HISTORY'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage) {
		let messageBank = await msg.channel.messages.fetch({ limit: 100 });

		for (let i = 0; i < 3; i++) {
			const fetchedMessages = await msg.channel.messages.fetch({
				limit: 100,
				before: messageBank.last()!.id
			});
			messageBank = messageBank.concat(fetchedMessages);
		}

		for (let i = 0; i < messageBank.size; i++) {
			const message = messageBank.random();
			if (message.author.bot) continue;
			if (message.content.replace(/\W/g, '').replace(/[0-9]/g, '').length < 20) continue;

			const embed = new MessageEmbed()
				.setDescription(message.content)
				.setAuthor(message.author.username, message.author.displayAvatarURL());
			return msg.send({ embed });
		}
		return msg.sendLocale('NO_QUOTE');
	}
}
