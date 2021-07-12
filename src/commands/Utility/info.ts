import { MessageButton, MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

import { informationalButtons } from '../../lib/constants';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows some informational links relating to the bot.',
			examples: ['+info'],
			categoryFlags: ['utility'],
			aliases: ['help']
		});
	}

	async run(msg: KlasaMessage) {
		return msg.channel.send({
			embeds: [
				new MessageEmbed()
					.setTitle('Bot School Old')
					.setThumbnail(
						'https://cdn.discordapp.com/avatars/729244028989603850/4d9983de6c235f12aa0c21e0c67cf232.png?size=2048'
					)
					.setDescription(
						`🧑‍⚖️ **Rules:** You *must* follow our 5 simple rules, breaking any rule can result in a permanent ban - and "I didn't know the rules" is not a valid excuse, read them here: <https://wiki.oldschool.gg/rules>

<:patreonLogo:679334888792391703> **Patreon:** If you're able too, please consider supporting my work on Patreon, it's highly appreciated and helps me hugely <https://www.patreon.com/oldschoolbot> ❤️

📢 **News:** Follow <#748492872428290158> for updates and news about the bot.

Please click the buttons below for important links.`
					)
			],
			components: [
				informationalButtons,

				[
					new MessageButton()
						.setLabel('Bug Reports')
						.setURL('https://github.com/oldschoolgg/oldschoolbot/issues/new?labels=&template=bug.md')
						.setEmoji('778418736330833951')
						.setStyle('LINK'),
					new MessageButton()
						.setLabel('Suggestions')
						.setURL(
							'https://github.com/oldschoolgg/oldschoolbot/issues/new?labels=feature+request&template=feature.md'
						)
						.setEmoji('💭')
						.setStyle('LINK')
				]
			]
		});
	}
}
