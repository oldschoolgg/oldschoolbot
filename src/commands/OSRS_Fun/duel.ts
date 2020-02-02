import { KlasaClient, CommandStore, KlasaUser, KlasaMessage } from 'klasa';
import { User } from 'discord.js';
import { toKMB } from 'oldschooljs/dist/util/util';

import { sleep } from '../../lib/util';
import { BotCommand } from '../../lib/BotCommand';
import { Emoji, ClientSettings, UserSettings, Time } from '../../lib/constants';

const options = {
	max: 1,
	time: 15000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, {
			description: 'Simulates dueling another player.',
			usage: '<user:user|user:str> [amount:int{10000}]',
			usageDelim: ' ',
			cooldown: 5,
			oneAtTime: true
		});
	}

	async checkBal(user: KlasaUser, amount: number) {
		await user.settings.sync(true);
		return user.settings.get('GP') >= amount;
	}

	async run(msg: KlasaMessage, [user, amount]: [KlasaUser, number]) {
		if (!amount) {
			return msg.send(
				`${Math.random() >= 0.5 ? msg.author : user} won the duel with ${Math.floor(
					Math.random() * 30 + 1
				)} HP remaining.`
			);
		}

		if (Date.now() - msg.author.createdTimestamp < Time.Month) {
			throw `You cannot use this command, as your account is too new and/or ` +
				`looks like it might be an alt account.`;
		}

		if (!(user instanceof User)) throw `You didn't mention a user to duel.`;
		if (user.id === msg.author.id) throw `You cant duel yourself.`;
		if (user.bot) throw `You cant duel a bot.`;

		if (!(await this.checkBal(msg.author, amount))) {
			return msg.send('You dont have have enough GP to duel that much.');
		}

		if (!(await this.checkBal(user, amount))) {
			return msg.send('That person doesnt have enough GP to duel that much.');
		}

		const duelMsg = await msg.channel.send(
			`${user.username}, say \`fight\` if you accept the duel for ${toKMB(amount)} GP.`
		);

		try {
			const collected = await msg.channel.awaitMessages(
				_msg => _msg.author.id === user.id && _msg.content.toLowerCase() === 'fight',
				options
			);
			if (!collected || !collected.first()) {
				throw "This shouldn't be possible...";
			}
		} catch (err) {
			return duelMsg.edit(`The user didn't accept the duel.`);
		}

		if (!(await this.checkBal(msg.author, amount)) || !(await this.checkBal(user, amount))) {
			return msg.send(Emoji.Bpaptu);
		}

		await msg.author.removeGP(amount);
		await user.removeGP(amount);

		await duelMsg.edit(`${user.username} accepted the duel. You both enter the duel arena...`);

		await sleep(2000);
		await duelMsg.edit(`${user.username} and ${msg.author.username} begin fighting...`);

		let [winner, loser] = Math.random() > 0.5 ? [user, msg.author] : [msg.author, user];

		await sleep(2000);
		await duelMsg.edit(`The fight is almost over...`);
		await sleep(2000);

		const winningAmount = amount * 2;
		const tax = winningAmount - winningAmount * 0.95;

		const dicingBank = this.client.settings.get(ClientSettings.EconomyStats.DuelTaxBank);
		const dividedAmount = tax / 1_000_000;
		this.client.settings.update(
			ClientSettings.EconomyStats.DuelTaxBank,
			dicingBank + Math.round(dividedAmount * 100) / 100
		);

		const winsOfWinner = winner.settings.get(UserSettings.Stats.Duel.Wins);
		winner.settings.update(UserSettings.Stats.Duel.Wins, winsOfWinner + 1);

		const lossesOfLoser = loser.settings.get(UserSettings.Stats.Duel.Losses);
		loser.settings.update(UserSettings.Stats.Duel.Losses, lossesOfLoser + 1);

		await winner.addGP(winningAmount - tax);

		// @ts-ignore
		const gpImage = this.client.commands.get('bank').generateImage(winningAmount);

		return msg.channel.send(
			`Congratulations ${winner.username}! You won ${toKMB(winningAmount)}, and paid ${toKMB(
				tax
			)} tax.`,
			gpImage
		);
	}
}
