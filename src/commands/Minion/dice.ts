import { CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Util } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { Image, Color, Emoji, Channel } from '../../lib/constants';
import { UserSettings } from '../../lib/UserSettings';
import { ClientSettings } from '../../lib/ClientSettings';
import { rand } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Simulates dice rolls from Runescape.',
			usage: '[amount:int{1}]',
			requiredPermissions: ['EMBED_LINKS'],
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [amount]: [number]) {
		if (msg.author.Ironman) throw `Your an ironman and you cant play dice.`;
		const roll = rand(1, 100);

		const embed = new MessageEmbed()
			.setColor(Color.Orange)
			.setThumbnail(Image.DiceBag)
			.setTitle('Dice Roll');

		if (!amount) {
			embed.setDescription(`You rolled **${roll}** on the percentile dice.`);
		} else {
			if (amount > 2_000_000_000) {
				throw `You can only dice up to 2bil at a time!`;
			}

			if (amount < 200_000) {
				throw `You have to dice atleast 200k.`;
			}

			await msg.author.settings.sync(true);
			const gp = msg.author.settings.get(UserSettings.GP);
			if (amount > gp) throw "You don't have enough GP.";
			const won = roll >= 55;
			let amountToAdd = won ? gp + amount : gp - amount;
			if (roll === 73) amountToAdd += amount > 100 ? amount * 0.2 : amount + 73;

			await msg.author.settings.update(UserSettings.GP, amountToAdd);

			const dicingBank = this.client.settings.get(ClientSettings.EconomyStats.DicingBank);
			const dividedAmount = (dicingBank + (won ? -amount : amount)) / 1_000_000;
			this.client.settings.update(
				ClientSettings.EconomyStats.DicingBank,
				Math.floor(dicingBank + Math.round(dividedAmount * 100) / 100)
			);

			if (won) {
				const wins = msg.author.settings.get(UserSettings.Stats.DiceWins);
				msg.author.settings.update(UserSettings.Stats.DiceWins, wins + 1);
			} else {
				const losses = msg.author.settings.get(UserSettings.Stats.DiceLosses);
				msg.author.settings.update(UserSettings.Stats.DiceLosses, losses + 1);
			}

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
