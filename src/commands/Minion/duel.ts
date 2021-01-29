import { User } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Util } from 'oldschooljs';

import { Emoji, Events } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { noOp, sleep } from '../../lib/util';
import BankCommand from './bank';

const options = {
	max: 1,
	time: 15000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description:
				'Simulates dueling another player, or allows you to duel another player for their bot GP.',
			usage: '<user:user|user:str> [amount:int{10000}]',
			usageDelim: ' ',
			cooldown: 5,
			oneAtTime: true,
			altProtection: true,
			ironCantUse: true,
			examples: ['+duel @Magnaboy', '+duel @Magnaboy 1m'],
			categoryFlags: ['minion', 'utility']
		});
	}

	async checkBal(user: KlasaUser, amount: number) {
		await user.settings.sync(true);
		return user.settings.get(UserSettings.GP) >= amount;
	}

	async run(msg: KlasaMessage, [user, amount]: [KlasaUser, number]) {
		if (!amount) {
			return msg.send(
				`${
					Math.random() >= 0.5 ? msg.author.username : user.username
				} won the duel with ${Math.floor(Math.random() * 30 + 1)} HP remaining.`
			);
		}

		if (msg.author.isIronman) return msg.send(`You can't duel someone as an ironman.`);
		if (user.isIronman) return msg.send(`You can't duel someone as an ironman.`);
		if (!(user instanceof User)) return msg.send(`You didn't mention a user to duel.`);
		if (user.id === msg.author.id) return msg.send(`You cant duel yourself.`);
		if (user.bot) return msg.send(`You cant duel a bot.`);
		if (user.isBusy) return msg.send(`That user is busy right now.`);

		user.toggleBusy(true);
		msg.author.toggleBusy(true);
		try {
			await this.game(msg, user, amount);
		} finally {
			user.toggleBusy(false);
			msg.author.toggleBusy(false);
		}
	}

	async game(msg: KlasaMessage, user: KlasaUser, amount: number) {
		if (!(await this.checkBal(msg.author, amount))) {
			return msg.send('You dont have have enough GP to duel that much.');
		}

		if (!(await this.checkBal(user, amount))) {
			return msg.send("That person doesn't have enough GP to duel that much.");
		}

		const duelMsg = await msg.channel.send(
			`${user.username}, say \`fight\` if you accept the duel for ${Util.toKMB(amount)} GP.`
		);

		try {
			await msg.channel.awaitMessages(
				_msg => _msg.author.id === user.id && _msg.content.toLowerCase() === 'fight',
				options
			);
		} catch (err) {
			return duelMsg.edit(`The user didn't accept the duel.`);
		}

		if (!(await this.checkBal(msg.author, amount)) || !(await this.checkBal(user, amount))) {
			return msg.send(Emoji.Bpaptu);
		}

		await msg.author.removeGP(amount);
		await user.removeGP(amount);

		await duelMsg
			.edit(`${user.username} accepted the duel. You both enter the duel arena...`)
			.catch(noOp);

		await sleep(2000);
		await duelMsg
			.edit(`${user.username} and ${msg.author.username} begin fighting...`)
			.catch(noOp);

		const [winner, loser] = Math.random() > 0.5 ? [user, msg.author] : [msg.author, user];

		await sleep(2000);
		await duelMsg.edit(`The fight is almost over...`).catch(noOp);
		await sleep(2000);

		const winningAmount = amount * 2;
		const tax = winningAmount - winningAmount * 0.95;

		const dicingBank = this.client.settings.get(ClientSettings.EconomyStats.DuelTaxBank);
		const dividedAmount = tax / 1_000_000;
		this.client.settings.update(
			ClientSettings.EconomyStats.DuelTaxBank,
			Math.floor(dicingBank + Math.round(dividedAmount * 100) / 100)
		);

		const winsOfWinner = winner.settings.get(UserSettings.Stats.DuelWins);
		winner.settings.update(UserSettings.Stats.DuelWins, winsOfWinner + 1);

		const lossesOfLoser = loser.settings.get(UserSettings.Stats.DuelLosses);
		loser.settings.update(UserSettings.Stats.DuelLosses, lossesOfLoser + 1);

		await winner.addGP(winningAmount - tax);

		if (amount >= 1_000_000_000) {
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.MoneyBag} **${winner.username}** just won a **${Util.toKMB(
					winningAmount
				)}** GP duel against ${loser.username}.`
			);
		}

		const gpImage = (this.client.commands.get('bank') as BankCommand).generateImage(
			winningAmount
		);

		this.client.emit(
			Events.EconomyLog,
			`${winner.sanitizedName} won ${winningAmount} GP in a duel with ${loser.sanitizedName}.`
		);

		return msg.channel.send(
			`Congratulations ${winner.username}! You won ${Util.toKMB(
				winningAmount
			)}, and paid ${Util.toKMB(tax)} tax.`,
			gpImage
		);
	}
}
