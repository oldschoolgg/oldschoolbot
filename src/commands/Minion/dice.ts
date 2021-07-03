import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Util } from 'oldschooljs';

import { Color, Emoji, Image } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { rand, updateGPTrackSetting } from '../../lib/util';

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

		const embed = new MessageEmbed().setColor(Color.Orange).setThumbnail(Image.DiceBag).setTitle('Dice Roll');

		if (!amount) {
			embed.setDescription(`You rolled **${roll}** on the percentile dice.`);
		} else {
			if (msg.author.isIronman) return msg.channel.send("You're an ironman and you cant play dice.");

			if (amount > 500_000_000) {
				return msg.channel.send('You can only dice up to 500m at a time!');
			}

			if (amount < 1_000_000) {
				return msg.channel.send('You have to dice atleast 1,000,000.');
			}

			await msg.author.settings.sync(true);
			const gp = msg.author.settings.get(UserSettings.GP);
			if (amount > gp) return msg.channel.send("You don't have enough GP.");
			const won = roll >= 55;
			let amountToAdd = won ? amount : -amount;

			await msg.author.addGP(amountToAdd);
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceDice, amountToAdd);

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
				} ${Util.toKMB(amountToAdd)} GP. ${roll === 73 ? Emoji.Bpaptu : ''}`
			);
		}

		return msg.channel.send({ embeds: [embed] });
	}
}
