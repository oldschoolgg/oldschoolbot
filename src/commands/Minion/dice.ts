import { MessageEmbed } from 'discord.js';
import { percentChance } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Util } from 'oldschooljs';

import { Color, Image } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { rand, updateGPTrackSetting } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Allows you to simulate dice rolls, or dice your bot GP.',
			usage: '[amount:int{1}]',
			requiredPermissionsForBot: ['EMBED_LINKS'],
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

			if (amount < 20_000_000 || amount > 10_000_000_000) {
				return msg.channel.send('You must dice atleast 20m and less than 10b.');
			}

			await msg.author.settings.sync(true);
			const gp = msg.author.settings.get(UserSettings.GP);
			if (amount > gp) return msg.channel.send("You don't have enough GP.");
			const won = roll >= 55;
			let amountToAdd = won ? amount : -amount;

			await msg.author.addGP(amountToAdd);
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceDice, amountToAdd);
			updateGPTrackSetting(msg.author, UserSettings.GPDice, amountToAdd);

			if (won) {
				const wins = msg.author.settings.get(UserSettings.Stats.DiceWins);
				msg.author.settings.update(UserSettings.Stats.DiceWins, wins + 1);
			} else {
				const losses = msg.author.settings.get(UserSettings.Stats.DiceLosses);
				msg.author.settings.update(UserSettings.Stats.DiceLosses, losses + 1);
			}

			if (amount >= 100_000_000 && won && percentChance(3)) {
				await msg.author.addItemsToBank({ items: new Bank().add('Gamblers bag'), collectionLog: true });
				return msg.channel.send(
					`${msg.author.username} rolled **${roll}** on the percentile dice, and you won ${Util.toKMB(
						amountToAdd
					)} GP.\n\nYou received a **Gamblers Bag**.`
				);
			}

			embed.setDescription(
				`${msg.author.username} rolled **${roll}** on the percentile dice, and you ${
					won ? 'won' : 'lost'
				} ${Util.toKMB(amountToAdd)} GP.`
			);
		}

		return msg.channel.send({ embeds: [embed] });
	}
}
