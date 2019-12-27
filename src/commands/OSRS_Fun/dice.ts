import { KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Util } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { Image, Color, Emoji, Channel } from '../../lib/constants';
import { rand } from '../../../config/util';

export default class extends BotCommand {
	public constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, {
			description: 'Simulates dice rolls from Runescape.',
			usage: '[amount:int{1}]',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg: KlasaMessage, [amount]: [number]) {
		const roll = rand(1, 100);

		const embed = new MessageEmbed()
			.setColor(Color.Orange)
			.setThumbnail(Image.DiceBag)
			.setTitle('Dice Roll');

		if (!amount) {
			embed.setDescription(`You rolled **${roll}** on the percentile dice.`);
		} else {
			await msg.author.settings.sync(true);
			const gp = msg.author.settings.get('GP');
			if (amount > gp) throw "You don't have enough GP.";
			const won = roll >= 55;
			let amountToAdd = won ? gp + amount : gp - amount;
			if (roll === 73) amountToAdd += amount > 100 ? amount * 0.2 : amount + 73;

			await msg.author.settings.update('GP', amountToAdd);

			embed.setDescription(
				`You rolled **${roll}** on the percentile dice, and you ${
					won ? 'won' : 'lost'
				} ${Util.toKMB(amountToAdd - gp)} GP. ${roll === 73 ? Emoji.Bpaptu : ''}`
			);

			const channel = this.client.channels.get(Channel.Notifications);

			if (amount >= 1_000_000_000 && channel) {
				(channel as TextChannel).send(
					`${Emoji.Dice} **${msg.author.username}** just diced **${Util.toKMB(
						amount
					)}** and ${won ? 'won' : 'lost'}.`
				);
			}
		}

		return msg.send({ embed });
	}
}
