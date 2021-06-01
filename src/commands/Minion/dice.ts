import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Util } from 'oldschooljs';

import { Color, Emoji, Image } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { rand, roll } from '../../lib/util';

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
		const rolled = rand(1, 100);

		const embed = new MessageEmbed()
			.setColor(Color.Orange)
			.setThumbnail(Image.DiceBag)
			.setTitle('Dice Roll');

		if (!amount) {
			embed.setDescription(`You rolled **${rolled}** on the percentile dice.`);
		} else {
			if (msg.author.isIronman) return msg.send(`You're an ironman and you cant play dice.`);

			if (amount < 20_000_000 || amount > 400_000_000) {
				return msg.send(`You must dice atleast 5m and less than 400m.`);
			}

			await msg.author.settings.sync(true);
			const gp = msg.author.settings.get(UserSettings.GP);

			const hasRing = msg.author.hasItemEquippedOrInBank('Ring of luck');
			if (roll(hasRing ? 100 : 10) && amount !== gp) {
				await msg.channel.send(
					`${msg.author.minionName} ignores your amount and decides to gamble your entire cash stack!`
				);
				amount = gp;
			}

			if (amount > gp) throw "You don't have enough GP.";
			const won = rolled >= 55;
			let amountToAdd = won ? gp + amount : gp - amount;
			if (rolled === 73) amountToAdd += amount > 100 ? amount * 0.2 : amount + 73;

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

			if (amount >= 100_000_000 && won && roll(30)) {
				await msg.author.addItemsToBank(new Bank().add('Gamblers bag'), true);
				return msg.send(
					`${
						msg.author.username
					} rolled **${rolled}** on the percentile dice, and you won ${Util.toKMB(
						amountToAdd - gp
					)} GP.\n\nYou received a **Gamblers Bag**.`
				);
			}

			embed.setDescription(
				`${msg.author.username} rolled **${rolled}** on the percentile dice, and you ${
					won ? 'won' : 'lost'
				} ${Util.toKMB(amountToAdd - gp)} GP. ${rolled === 73 ? Emoji.Bpaptu : ''}`
			);
		}

		return msg.send({ embed });
	}
}
