import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Util } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { Color, Emoji, Events, Image } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { rand } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Allows you to simulate dice rolls, or dice your bot GP.',
			usage: '[amount:int{1}]',
			requiredPermissions: ['EMBED_LINKS'],
			oneAtTime: true,
			categoryFlags: ['minion', 'utility'],
			examples: ['+dice', '+dice 1m']
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
			if (msg.author.isIronman) return msg.send(`You're an ironman and you cant play dice.`);

			if (amount > 500_000) {
				return msg.send(`You can only dice up to 500m at a time!`);
			}

			if (amount < 200_000) {
				return msg.send(`You have to dice atleast 200k.`);
			}

			await msg.author.settings.sync(true);
			const gp = msg.author.settings.get(UserSettings.GP);
			if (amount > gp) return msg.send("You don't have enough GP.");
			const won = roll >= 55;
			let amountToAdd = won ? gp + amount : gp - amount;
			if (roll === 73) amountToAdd += amount > 100 ? amount * 0.2 : amount + 73;

			await msg.author.settings.update(UserSettings.GP, amountToAdd);

			const dicingBank = this.client.settings.get(ClientSettings.EconomyStats.DicingBank);
			const dividedAmount = (won ? -amount : amount) / 1_000_000;
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
				`${msg.author.username} rolled **${roll}** on the percentile dice, and you ${
					won ? 'won' : 'lost'
				} ${Util.toKMB(amountToAdd - gp)} GP. ${roll === 73 ? Emoji.Bpaptu : ''}`
			);
		}

		return msg.send({ embed });
	}
}
